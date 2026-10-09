const express = require("express");
const { getVoters, updateVoterStatus, checkDuplicateVoters, exportVoterRoll } = require("../controllers/voterRollController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getVoters);
router.get("/duplicates", authenticate, authorizeRoles("ADMIN"), checkDuplicateVoters);
router.get("/export", authenticate, authorizeRoles("ADMIN"), exportVoterRoll);
router.patch("/:id", authenticate, authorizeRoles("ADMIN"), updateVoterStatus);

const pool = require("../config/database");

// Update voter details
router.put(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { name, email, phone, address, is_verified, is_active } = req.body;
            const result = await pool.query(
                `UPDATE users 
                 SET name = $1, email = $2, phone = $3, address = $4, is_verified = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7 RETURNING id, name, email, phone, address, is_verified, is_active, role`,
                [name, email, phone, address, is_verified, is_active, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Voter not found." });
            }
            res.json({ success: true, voter: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            if (parseInt(req.params.id) === 1 || parseInt(req.params.id) === req.user.userId) {
                return res.status(403).json({ success: false, message: "Cannot delete master administrator account." });
            }
            const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, name, email", [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Voter not found." });
            }
            res.json({ success: true, message: "Voter deleted successfully." });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

module.exports = router;
