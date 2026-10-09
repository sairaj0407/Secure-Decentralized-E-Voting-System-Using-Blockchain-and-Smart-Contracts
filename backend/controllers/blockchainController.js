const {
    votingContract,
    provider,
    CONTRACT_ADDRESS,
} = require("../config/blockchain");

const {
    getBlockchainElection,
    getBlockchainCandidates,
} = require("../services/blockchainService");


// ============================================================
// BLOCKCHAIN STATUS
// ============================================================

const getBlockchainStatus = async (req, res) => {

    try {

        const network =
            await provider.getNetwork();

        const blockNumber =
            await provider.getBlockNumber();

        let admin = null;

        if (votingContract) {
            admin =
                await votingContract.admin();
        }

        res.json({
            success: true,

            blockchain: {
                rpcUrl:
                    process.env.BLOCKCHAIN_RPC_URL,

                chainId:
                    network.chainId.toString(),

                blockNumber,

                contractAddress:
                    CONTRACT_ADDRESS,

                contractAdmin:
                    admin,
            },
        });

    } catch (error) {

        console.error(
            "Blockchain status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to connect to blockchain.",
            error: error.message,
        });
    }
};


// ============================================================
// READ BLOCKCHAIN ELECTION
// ============================================================

const getElectionFromBlockchain = async (
    req,
    res
) => {

    try {

        const { electionId } =
            req.params;

        const election =
            await getBlockchainElection(
                electionId
            );

        res.json({
            success: true,

            election: {
                id: election.id.toString(),

                title:
                    election.title,

                description:
                    election.description,

                startTime:
                    election.startTime.toString(),

                endTime:
                    election.endTime.toString(),

                status:
                    election.status.toString(),

                exists:
                    election.exists,
            },
        });

    } catch (error) {

        console.error(
            "Blockchain election error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch blockchain election.",
            error: error.message,
        });
    }
};


// ============================================================
// READ BLOCKCHAIN CANDIDATES
// ============================================================

const getCandidatesFromBlockchain = async (
    req,
    res
) => {

    try {

        const { electionId } =
            req.params;

        const candidates =
            await getBlockchainCandidates(
                electionId
            );

        const formattedCandidates =
            candidates.map(
                (candidate) => ({
                    id:
                        candidate.id.toString(),

                    name:
                        candidate.name,

                    party:
                        candidate.party,

                    symbol:
                        candidate.symbol,

                    manifesto:
                        candidate.manifesto,

                    voteCount:
                        candidate.voteCount.toString(),

                    exists:
                        candidate.exists,
                })
            );

        res.json({
            success: true,
            candidates:
                formattedCandidates,
        });

    } catch (error) {

        console.error(
            "Blockchain candidates error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch blockchain candidates.",
            error: error.message,
        });
    }
};


const pool = require("../config/database");

const getRecentTransactions = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM blockchain_transactions 
             ORDER BY created_at DESC LIMIT 50`
        );
        res.json({
            success: true,
            transactions: result.rows
        });
    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve transactions from database.",
            error: error.message
        });
    }
};

const verifyTransactionOnLedger = async (req, res) => {
    try {
        const query = (req.params.query || "").trim();
        if (!query) {
            return res.status(400).json({ success: false, message: "Transaction hash or receipt code is required." });
        }

        let txHash = query;
        let receiptRecord = null;

        // Check if query is a receipt code
        if (txHash.startsWith("REC-") || !txHash.startsWith("0x")) {
            const rcptRes = await pool.query(
                `SELECT vr.*, e.title as election_title, e.blockchain_election_id 
                 FROM voter_receipts vr 
                 JOIN elections e ON vr.election_id = e.id 
                 WHERE vr.receipt_code = $1`,
                [txHash]
            );
            if (rcptRes.rows.length > 0) {
                receiptRecord = rcptRes.rows[0];
                txHash = receiptRecord.tx_hash;
            } else {
                return res.status(404).json({ success: false, message: "Receipt code not found in ledger archives." });
            }
        }

        let tx = null;
        let receipt = null;
        try {
            tx = await provider.getTransaction(txHash);
            receipt = await provider.getTransactionReceipt(txHash);
        } catch (chainErr) {
            console.warn("[Blockchain Explorer] RPC error:", chainErr.message);
        }

        const currentBlock = await provider.getBlockNumber();

        if (!tx || !receipt) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found on Ethereum ledger. Verify the hash or check node status."
            });
        }

        const confirmations = Math.max(1, currentBlock - Number(receipt.blockNumber) + 1);

        res.json({
            success: true,
            verified: receipt.status === 1,
            ledgerProof: {
                txHash: tx.hash,
                blockNumber: Number(receipt.blockNumber),
                confirmations,
                from: tx.from,
                to: tx.to,
                gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : "0",
                contractAddress: CONTRACT_ADDRESS,
                status: receipt.status === 1 ? "COMMITTED & IMMUTABLE" : "REVERTED",
                receiptCode: receiptRecord ? receiptRecord.receipt_code : null,
                electionTitle: receiptRecord ? receiptRecord.election_title : null,
                blockchainElectionId: receiptRecord ? receiptRecord.blockchain_election_id : null,
                verifiedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getBlockchainStatus,
    getElectionFromBlockchain,
    getCandidatesFromBlockchain,
    getRecentTransactions,
    verifyTransactionOnLedger
};