const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
    getStates,
    getDistricts,
    getParliamentaryConstituencies,
    getAssemblyConstituencies,
    getReferenceParties,
    getElectionSymbols,
    getReferenceElections,
    getReferenceElectionStatistics,
    addState,
    updateState,
    verifyState,
    archiveState,
    addParty,
    updateParty,
    verifyParty,
    archiveParty,
    validateImport,
    approveImport
} = require("../controllers/refDataController");

// Public/Voter & Admin access endpoints
router.get("/states", getStates);
router.get("/districts", getDistricts);
router.get("/parliamentary-constituencies", getParliamentaryConstituencies);
router.get("/assembly-constituencies", getAssemblyConstituencies);
router.get("/parties", getReferenceParties);
router.get("/symbols", getElectionSymbols);
router.get("/elections", getReferenceElections);
router.get("/statistics/:election_id", getReferenceElectionStatistics);

// Admin-only management endpoints
router.post("/states", authenticate, authorizeRoles("ADMIN"), addState);
router.put("/states/:id", authenticate, authorizeRoles("ADMIN"), updateState);
router.post("/states/:id/verify", authenticate, authorizeRoles("ADMIN"), verifyState);
router.delete("/states/:id", authenticate, authorizeRoles("ADMIN"), archiveState);

router.post("/parties", authenticate, authorizeRoles("ADMIN"), addParty);
router.put("/parties/:id", authenticate, authorizeRoles("ADMIN"), updateParty);
router.post("/parties/:id/verify", authenticate, authorizeRoles("ADMIN"), verifyParty);
router.delete("/parties/:id", authenticate, authorizeRoles("ADMIN"), archiveParty);

// CSV Import endpoints (Admin only)
router.post("/import/validate", authenticate, authorizeRoles("ADMIN"), validateImport);
router.post("/import/approve", authenticate, authorizeRoles("ADMIN"), approveImport);

module.exports = router;
