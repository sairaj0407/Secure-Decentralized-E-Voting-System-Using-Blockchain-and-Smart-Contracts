const express = require("express");
const { getPollingStations, createPollingStation, assignOfficer } = require("../controllers/pollingStationController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getPollingStations);
router.post("/", authenticate, authorizeRoles("ADMIN"), createPollingStation);
router.patch("/:id/officer", authenticate, authorizeRoles("ADMIN"), assignOfficer);

const pool = require("../config/database");

// Update polling station
router.put(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { name, code, address, constituency_id, capacity } = req.body;
            const result = await pool.query(
                `UPDATE polling_stations 
                 SET name = $1, code = $2, address = $3, constituency_id = $4, capacity = $5 
                 WHERE id = $6 RETURNING *`,
                [name, code, address, constituency_id, capacity, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Polling station not found." });
            }
            res.json({ success: true, pollingStation: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// Delete polling station
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const result = await pool.query("DELETE FROM polling_stations WHERE id = $1 RETURNING *", [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Polling station not found." });
            }
            res.json({ success: true, message: "Polling station deleted successfully." });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

module.exports = router;
