const express = require("express");
const { getParties, createParty } = require("../controllers/partyController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getParties);
router.post("/", authenticate, authorizeRoles("ADMIN"), createParty);

const pool = require("../config/database");

// Update political party
router.put(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { name, abbreviation, symbol, leader, contact_info } = req.body;
            const result = await pool.query(
                `UPDATE parties 
                 SET name = $1, abbreviation = $2, symbol = $3, leader = $4, contact_info = $5 
                 WHERE id = $6 RETURNING *`,
                [name, abbreviation, symbol, leader || null, contact_info, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Party not found." });
            }
            res.json({ success: true, party: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// Delete political party
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const result = await pool.query("DELETE FROM parties WHERE id = $1 RETURNING *", [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Party not found." });
            }
            res.json({ success: true, message: "Party deleted successfully." });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

module.exports = router;
