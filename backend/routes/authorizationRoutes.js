const express = require("express");

const {
    authorizeVoter,
    batchAuthorizeVoters,
    getAuthorizedVoters,
    checkVoterAuthorization
} = require("../controllers/authorizationController");

const {
    authenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// ADMIN - AUTHORIZE SINGLE VOTER
// ============================================================

router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    authorizeVoter
);


// ============================================================
// ADMIN - BATCH AUTHORIZE VOTERS
// ============================================================

router.post(
    "/batch",
    authenticate,
    authorizeRoles("ADMIN"),
    batchAuthorizeVoters
);


// ============================================================
// ADMIN - VIEW AUTHORIZED VOTERS
// ============================================================

router.get(
    "/election/:electionId",
    authenticate,
    authorizeRoles("ADMIN"),
    getAuthorizedVoters
);


// ============================================================
// VOTER - CHECK OWN AUTHORIZATION
// ============================================================

router.get(
    "/check/:electionId",
    authenticate,
    authorizeRoles("VOTER"),
    checkVoterAuthorization
);


module.exports = router;