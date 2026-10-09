const express = require("express");
const router = express.Router();
const { getDatabaseOverview, getTableData } = require("../controllers/databaseController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// All database explorer routes are strictly restricted to authenticated ADMIN role
router.get("/overview", authenticate, authorizeRoles("ADMIN"), getDatabaseOverview);
router.get("/table/:tableName", authenticate, authorizeRoles("ADMIN"), getTableData);

module.exports = router;
