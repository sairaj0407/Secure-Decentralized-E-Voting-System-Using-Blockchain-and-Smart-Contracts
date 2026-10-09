const express = require("express");

const {
    getBlockchainStatus,
    getElectionFromBlockchain,
    getCandidatesFromBlockchain,
    getRecentTransactions,
    verifyTransactionOnLedger
} = require("../controllers/blockchainController");

const router = express.Router();


router.get(
    "/status",
    getBlockchainStatus
);

// Cryptographic Ledger Explorer / On-Chain Audit
router.get(
    "/verify/:query",
    verifyTransactionOnLedger
);


router.get(
    "/election/:electionId",
    getElectionFromBlockchain
);


router.get(
    "/election/:electionId/candidates",
    getCandidatesFromBlockchain
);


router.get(
    "/transactions",
    getRecentTransactions
);


module.exports = router;