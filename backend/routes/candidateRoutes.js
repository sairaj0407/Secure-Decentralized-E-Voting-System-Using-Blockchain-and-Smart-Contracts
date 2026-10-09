const express = require("express");

const {
    addCandidate,
    getCandidatesByElection,
    getCandidateById,
    getAllCandidates
} = require("../controllers/candidateController");

const {
    authenticate,
    optionalAuthenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// GET ALL CANDIDATES ACROSS ELECTIONS (PUBLIC / OPTIONAL AUTH)
// ============================================================

router.get(
    "/",
    optionalAuthenticate,
    getAllCandidates
);


// ============================================================
// ADMIN - ADD CANDIDATE
// ============================================================

router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    addCandidate
);


// ============================================================
// GET CANDIDATES FOR ELECTION (PUBLIC / OPTIONAL AUTH)
// ============================================================

router.get(
    "/election/:electionId",
    optionalAuthenticate,
    getCandidatesByElection
);


// ============================================================
// GET CANDIDATE BY ID (PUBLIC / OPTIONAL AUTH)
// ============================================================

router.get(
    "/:id",
    optionalAuthenticate,
    getCandidateById
);


const pool = require("../config/database");

// Update candidate
router.put(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { name, party, symbol, biography, party_id, status } = req.body;
            const result = await pool.query(
                `UPDATE candidates 
                 SET name = $1, party = $2, symbol = $3, biography = $4, party_id = $5, status = $6, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7 RETURNING *`,
                [name, party, symbol, biography, party_id || null, status || 'FINAL', req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Candidate not found." });
            }
            res.json({ success: true, candidate: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// Delete candidate
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const result = await pool.query("DELETE FROM candidates WHERE id = $1 RETURNING *", [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Candidate not found." });
            }
            res.json({ success: true, message: "Candidate deleted successfully." });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

module.exports = router;