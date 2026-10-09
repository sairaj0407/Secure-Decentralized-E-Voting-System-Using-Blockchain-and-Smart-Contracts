const express = require("express");

const {
    getElectionResults
} = require("../controllers/resultController");

const {
    publishResults
} = require("../controllers/electionController");

const {
    authenticate,
    optionalAuthenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/election/:electionId",
    optionalAuthenticate,
    getElectionResults
);

router.get(
    "/:electionId",
    optionalAuthenticate,
    getElectionResults
);

router.post(
    "/election/:id/publish",
    authenticate,
    authorizeRoles("ADMIN"),
    publishResults
);

module.exports = router;