const express = require("express");

const {
    castVote,
    getVoterReceipt,
    getMyVotedElections
} = require("../controllers/voteController");

const {
    authenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// VOTER - CAST VOTE
// ============================================================

router.post(
    "/",
    authenticate,
    authorizeRoles("VOTER"),
    castVote
);

router.get(
    "/my-votes",
    authenticate,
    getMyVotedElections
);

router.get(
    "/receipt/:electionId",
    authenticate,
    getVoterReceipt
);


module.exports = router;
