const express = require("express");
const router = express.Router();
const {
    submitRequest,
    getMyRequests,
    getAllRequests,
    updateRequestStatus
} = require("../controllers/voterServiceController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Voter endpoints
router.post("/submit", authenticate, authorizeRoles("VOTER"), submitRequest);
router.get("/my-requests", authenticate, authorizeRoles("VOTER"), getMyRequests);

// Admin endpoints
router.get("/admin/all", authenticate, authorizeRoles("ADMIN"), getAllRequests);
router.put("/admin/:id/status", authenticate, authorizeRoles("ADMIN"), updateRequestStatus);

module.exports = router;
