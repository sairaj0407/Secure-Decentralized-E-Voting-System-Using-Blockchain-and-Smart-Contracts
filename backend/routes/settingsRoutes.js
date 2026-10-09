const express = require("express");
const { backupDatabase, restoreDatabase, runAnalytics, getReconciliation } = require("../controllers/settingsController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/backup", authenticate, authorizeRoles("ADMIN"), backupDatabase);
router.post("/restore", authenticate, authorizeRoles("ADMIN"), restoreDatabase);
router.post("/analytics", authenticate, authorizeRoles("ADMIN"), runAnalytics);
router.get("/reconciliation", authenticate, authorizeRoles("ADMIN"), getReconciliation);

module.exports = router;
