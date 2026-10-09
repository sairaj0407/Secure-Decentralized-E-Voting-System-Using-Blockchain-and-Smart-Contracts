require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");
const { votingContract } = require("../config/blockchain");
const { registerCandidateOnBlockchain } = require("../services/blockchainService");

const ELECTION_ID = 14;
const CANDIDATE_NAME = "Priya Patil";

(async () => {
    try {
        console.log("Checking candidate sync status...");
        if (!votingContract) {
            console.error("Blockchain contract not configured.");
            process.exit(1);
        }

        // Get election blockchain ID
        const electionRes = await pool.query(
            "SELECT id, blockchain_election_id FROM elections WHERE id = $1",
            [ELECTION_ID]
        );

        if (electionRes.rows.length === 0) {
            console.error(`PostgreSQL election ${ELECTION_ID} not found.`);
            process.exit(1);
        }

        const blockchainElectionId = electionRes.rows[0].blockchain_election_id;
        console.log(`Election #14 maps to Blockchain Election ID: ${blockchainElectionId}`);

        // Get candidates on-chain
        const onChainCandidates = await votingContract.getCandidates(blockchainElectionId);
        const existsOnChain = onChainCandidates.some(c => c.name === CANDIDATE_NAME);

        if (existsOnChain) {
            console.log(`Candidate ${CANDIDATE_NAME} is already registered on-chain.`);
            process.exit(0);
        }

        console.log(`Candidate ${CANDIDATE_NAME} is not registered on-chain. Syncing...`);

        // Fetch candidate details from Postgres
        const candidateRes = await pool.query(
            "SELECT name, party, symbol, manifesto FROM candidates WHERE election_id = $1 AND name = $2",
            [ELECTION_ID, CANDIDATE_NAME]
        );

        if (candidateRes.rows.length === 0) {
            console.error(`PostgreSQL candidate ${CANDIDATE_NAME} not found in database.`);
            process.exit(1);
        }

        const candidate = candidateRes.rows[0];

        // Register candidate on blockchain
        const syncResult = await registerCandidateOnBlockchain(
            blockchainElectionId,
            candidate.name,
            candidate.party || "",
            candidate.symbol || "",
            candidate.manifesto || ""
        );

        console.log("Candidate registered on blockchain successfully!");
        console.log("Transaction Hash:", syncResult.transactionHash);

        const blockNumber = syncResult.receipt.blockNumber ? Number(syncResult.receipt.blockNumber) : null;
        const gasUsed = syncResult.receipt.gasUsed ? syncResult.receipt.gasUsed.toString() : null;

        // Save transaction to DB
        await pool.query(
            `INSERT INTO blockchain_transactions
                (election_id, tx_hash, block_number, wallet_address, gas_used, transaction_status, confirmed_at)
             VALUES
                ($1, $2, $3, $4, $5, 'CONFIRMED', CURRENT_TIMESTAMP)`,
            [
                ELECTION_ID,
                syncResult.transactionHash,
                blockNumber,
                process.env.BLOCKCHAIN_ADMIN_ADDRESS,
                gasUsed
            ]
        );

        console.log("Transaction saved to PostgreSQL blockchain_transactions table.");
        
        // Log audit
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, description)
             VALUES ($1, $2, $3)`,
            [
                2, // Admin user id
                "CANDIDATE_SYNCED",
                `Candidate "${candidate.name}" was synchronized on blockchain. Transaction: ${syncResult.transactionHash}`
            ]
        );
        console.log("Audit log saved.");

    } catch (error) {
        console.error("Sync error:", error);
    } finally {
        await pool.end();
    }
})();
