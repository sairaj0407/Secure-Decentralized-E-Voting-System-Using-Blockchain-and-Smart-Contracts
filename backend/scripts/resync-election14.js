/**
 * Re-sync Election #14 on-chain after a local Hardhat reset.
 * Preserves PostgreSQL election/candidate rows; updates blockchain mapping only.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

// Force reload of blockchain module after .env update
delete require.cache[require.resolve("../config/blockchain")];
delete require.cache[require.resolve("../services/blockchainService")];

const pool = require("../config/database");
const { votingContract } = require("../config/blockchain");
const {
    createElectionOnBlockchain,
    registerCandidateOnBlockchain,
    authorizeVoterOnBlockchain,
} = require("../services/blockchainService");

const ELECTION_ID = 14;
const VOTER_USER_ID = 1;

async function parseElectionCreatedId(receipt) {
    for (const log of receipt.logs || []) {
        try {
            const parsed = votingContract.interface.parseLog({
                topics: log.topics,
                data: log.data,
            });
            if (parsed?.name === "ElectionCreated") {
                return parsed.args.electionId.toString();
            }
        } catch {
            // ignore unrelated logs
        }
    }
    return null;
}

async function main() {
    if (!votingContract) {
        throw new Error("Blockchain contract is not configured.");
    }

    const electionResult = await pool.query(
        `SELECT id, title, description, start_time, end_time, blockchain_election_id
         FROM elections WHERE id = $1`,
        [ELECTION_ID]
    );

    if (electionResult.rows.length === 0) {
        throw new Error(`Election ${ELECTION_ID} not found.`);
    }

    const election = electionResult.rows[0];

    const candidatesResult = await pool.query(
        `SELECT id, name, party, symbol, manifesto
         FROM candidates WHERE election_id = $1 ORDER BY id`,
        [ELECTION_ID]
    );

    const voterResult = await pool.query(
        `SELECT id, name, wallet_address FROM users WHERE id = $1`,
        [VOTER_USER_ID]
    );

    if (voterResult.rows.length === 0) {
        throw new Error(`Voter user ${VOTER_USER_ID} not found.`);
    }

    const voter = voterResult.rows[0];

    const startTimestamp = Math.floor(new Date(election.start_time).getTime() / 1000);
    let endTimestamp = Math.floor(new Date(election.end_time).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (endTimestamp <= now) {
        endTimestamp = now + 7200;
        console.log(`Adjusted end time to future timestamp: ${endTimestamp}`);
    }

    console.log("Creating election on blockchain...");
    const createResult = await createElectionOnBlockchain(
        election.title,
        election.description || "",
        startTimestamp,
        endTimestamp
    );

    const blockchainElectionId = await parseElectionCreatedId(createResult.receipt);
    if (!blockchainElectionId) {
        throw new Error("Could not parse ElectionCreated event.");
    }

    console.log("Blockchain election ID:", blockchainElectionId);

    for (const candidate of candidatesResult.rows) {
        console.log(`Registering candidate on-chain: ${candidate.name}`);
        await registerCandidateOnBlockchain(
            blockchainElectionId,
            candidate.name,
            candidate.party || "",
            candidate.symbol || "",
            candidate.manifesto || ""
        );
    }

    console.log(`Authorizing voter ${voter.name} (${voter.wallet_address})...`);
    const authResult = await authorizeVoterOnBlockchain(
        blockchainElectionId,
        voter.wallet_address
    );

    await pool.query(
        `UPDATE elections
         SET blockchain_election_id = $1,
             contract_address = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [blockchainElectionId, process.env.EVOTING_CONTRACT_ADDRESS, ELECTION_ID]
    );

    await pool.query(
        `DELETE FROM voter_election_authorizations
         WHERE election_id = $1 AND user_id = $2`,
        [ELECTION_ID, VOTER_USER_ID]
    );

    await pool.query(
        `INSERT INTO voter_election_authorizations
            (user_id, election_id, is_authorized, has_voted, authorized_at)
         VALUES ($1, $2, TRUE, FALSE, NOW())`,
        [VOTER_USER_ID, ELECTION_ID]
    );

    await pool.query(
        `INSERT INTO blockchain_transactions
            (election_id, tx_hash, block_number, wallet_address, gas_used, transaction_status, confirmed_at)
         VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', NOW())`,
        [
            ELECTION_ID,
            authResult.transactionHash,
            Number(authResult.receipt.blockNumber),
            voter.wallet_address,
            authResult.receipt.gasUsed?.toString() || null,
        ]
    );

    const onChainAuth = await votingContract.authorizedVoters(
        blockchainElectionId,
        voter.wallet_address
    );

    console.log(JSON.stringify({
        success: true,
        postgresElectionId: ELECTION_ID,
        blockchainElectionId,
        contractAddress: process.env.EVOTING_CONTRACT_ADDRESS,
        candidateCount: candidatesResult.rows.length,
        voterAuthorizedOnChain: onChainAuth,
        authorizationTx: authResult.transactionHash,
    }, null, 2));

    await pool.end();
}

main().catch(async (error) => {
    console.error("Resync failed:", error.message);
    try {
        await pool.end();
    } catch {
        // ignore
    }
    process.exit(1);
});
