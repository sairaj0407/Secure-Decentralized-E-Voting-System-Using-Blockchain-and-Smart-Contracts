const express = require("express");
const router = express.Router();
const { authenticate, optionalAuthenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
    getOfficers,
    createOfficer,
    deleteOfficer,
    getSymbols,
    createSymbol,
    getGrievances,
    createGrievance,
    updateGrievance,
    getCompliance,
    createCompliance,
    updateCompliance,
    getIncidents,
    createIncident,
    updateIncident,
    getRepolls,
    createRepoll,
    getPhases,
    createPhase,
    getVersionHistory,
    getAuditReplay,
    verifyReceipt,
    getAllReceipts
} = require("../controllers/govController");

// Officers
router.get("/officers", optionalAuthenticate, getOfficers);
router.post("/officers", authenticate, authorizeRoles("ADMIN"), createOfficer);
router.delete("/officers/:id", authenticate, authorizeRoles("ADMIN"), deleteOfficer);

// Symbols
router.get("/symbols", optionalAuthenticate, getSymbols);
router.post("/symbols", authenticate, authorizeRoles("ADMIN"), createSymbol);

// Grievances
router.get("/grievances", authenticate, getGrievances);
router.post("/grievances", authenticate, createGrievance);
router.put("/grievances/:id", authenticate, updateGrievance);

// Compliance
router.get("/compliance", authenticate, getCompliance);
router.post("/compliance", authenticate, createCompliance);
router.put("/compliance/:id", authenticate, updateCompliance);

// Incidents
router.get("/incidents", authenticate, getIncidents);
router.post("/incidents", authenticate, createIncident);
router.put("/incidents/:id", authenticate, updateIncident);

// Re-polls
router.get("/repolls", authenticate, getRepolls);
router.post("/repolls", authenticate, authorizeRoles("ADMIN"), createRepoll);

// Phases
router.get("/phases", optionalAuthenticate, getPhases);
router.post("/phases", authenticate, authorizeRoles("ADMIN"), createPhase);

// Version History
router.get("/version-history", authenticate, authorizeRoles("ADMIN"), getVersionHistory);

// Audit Replay
router.get("/audit-replay/:electionId", authenticate, getAuditReplay);

// Voter Receipts Ledger Audit
router.get("/receipts", authenticate, getAllReceipts);

// Public Receipt Verification
router.get("/verify-receipt/:code", verifyReceipt);

module.exports = router;
