const express = require("express");

const {
    createElection,
    getAllElections,
    getElectionById,
    startElection,
    endElection,
    publishResults,
    getStateElectionSummary
} = require("../controllers/electionController");

const {
    authenticate,
    optionalAuthenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// ADMIN ROUTES
// ============================================================

// Create election
router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    createElection
);


// ============================================================
// GENERAL & PUBLIC ROUTES
// ============================================================

// Get official state-wise electoral atlas summary (ECI National Map)
router.get(
    "/state-summary",
    getStateElectionSummary
);

// Get all elections
router.get(
    "/",
    optionalAuthenticate,
    getAllElections
);


// ============================================================
// START ELECTION
// ============================================================

router.patch(
    "/:id/start",
    authenticate,
    authorizeRoles("ADMIN"),
    startElection
);
router.post(
    "/:id/start",
    authenticate,
    authorizeRoles("ADMIN"),
    startElection
);
router.put(
    "/:id/start",
    authenticate,
    authorizeRoles("ADMIN"),
    startElection
);


// ============================================================
// END ELECTION
// ============================================================

router.patch(
    "/:id/end",
    authenticate,
    authorizeRoles("ADMIN"),
    endElection
);
router.post(
    "/:id/end",
    authenticate,
    authorizeRoles("ADMIN"),
    endElection
);
router.put(
    "/:id/end",
    authenticate,
    authorizeRoles("ADMIN"),
    endElection
);


// ============================================================
// PUBLISH RESULTS
// ============================================================

router.patch(
    "/:id/publish-results",
    authenticate,
    authorizeRoles("ADMIN"),
    publishResults
);
router.post(
    "/:id/publish-results",
    authenticate,
    authorizeRoles("ADMIN"),
    publishResults
);
router.put(
    "/:id/publish-results",
    authenticate,
    authorizeRoles("ADMIN"),
    publishResults
);


// ============================================================
// GET ELECTION BY ID (PUBLIC / OPTIONAL AUTH)
// ============================================================

router.get(
    "/:id",
    optionalAuthenticate,
    getElectionById
);


const pool = require("../config/database");

// Update election
router.put(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { title, description, start_time, end_time } = req.body;
            const result = await pool.query(
                `UPDATE elections 
                 SET title = $1, description = $2, start_time = $3, end_time = $4, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $5 RETURNING *`,
                [title, description, start_time, end_time, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Election not found." });
            }
            res.json({ success: true, election: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// Update election status (e.g., ARCHIVED, DRAFT, etc.)
router.put(
    "/:id/status",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ success: false, message: "Status is required." });
            }
            const result = await pool.query(
                `UPDATE elections 
                 SET status = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2 RETURNING *`,
                [status, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Election not found." });
            }
            res.json({ success: true, election: result.rows[0], message: `Election status updated to ${status}.` });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// Delete all elections (Bulk Clean)
router.delete(
    "/all",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("DELETE FROM votes");
            await client.query("DELETE FROM voter_receipts");
            await client.query("DELETE FROM voter_election_authorizations");
            await client.query("DELETE FROM repolls");
            await client.query("DELETE FROM election_phases");
            await client.query("DELETE FROM reference_election_statistics");
            await client.query("DELETE FROM blockchain_transactions WHERE election_id IS NOT NULL");
            await client.query("DELETE FROM candidates");
            const result = await client.query("DELETE FROM elections");
            
            try {
                await client.query("ALTER SEQUENCE elections_id_seq RESTART WITH 1");
                await client.query("ALTER SEQUENCE candidates_id_seq RESTART WITH 1");
            } catch (_) {}

            await client.query("COMMIT");
            res.json({ success: true, message: `Successfully deleted all ${result.rowCount} elections from the database.` });
        } catch (err) {
            await client.query("ROLLBACK");
            res.status(500).json({ success: false, message: err.message });
        } finally {
            client.release();
        }
    }
);

// Delete single election with clean cascade of dependent records
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        const electionId = req.params.id;
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("DELETE FROM votes WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM voter_receipts WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM voter_election_authorizations WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM repolls WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM election_phases WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM reference_election_statistics WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM blockchain_transactions WHERE election_id = $1", [electionId]);
            await client.query("DELETE FROM candidates WHERE election_id = $1", [electionId]);

            const result = await client.query("DELETE FROM elections WHERE id = $1 RETURNING *", [electionId]);
            if (result.rows.length === 0) {
                await client.query("ROLLBACK");
                return res.status(404).json({ success: false, message: "Election not found." });
            }

            await client.query("COMMIT");
            res.json({ success: true, message: "Election and all associated records deleted successfully." });
        } catch (err) {
            await client.query("ROLLBACK");
            res.status(500).json({ success: false, message: err.message });
        } finally {
            client.release();
        }
    }
);

module.exports = router;