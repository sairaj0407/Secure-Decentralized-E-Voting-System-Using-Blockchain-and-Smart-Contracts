const express = require("express");
const { getConstituencies, createConstituency } = require("../controllers/constituencyController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getConstituencies);
router.post("/", authenticate, authorizeRoles("ADMIN"), createConstituency);

const pool = require("../config/database");

// Update constituency
router.put(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const { name, code, level } = req.body;
            const result = await pool.query(
                "UPDATE constituencies SET name = $1, code = $2, level = $3 WHERE id = $4 RETURNING *",
                [name, code, level, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Constituency not found." });
            }
            res.json({ success: true, constituency: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// Delete constituency
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    async (req, res) => {
        try {
            const result = await pool.query("DELETE FROM constituencies WHERE id = $1 RETURNING *", [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Constituency not found." });
            }
            res.json({ success: true, message: "Constituency deleted successfully." });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

module.exports = router;
