/**
 * Complete on-chain setup for Election #14 using existing chain election ID 1.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

delete require.cache[require.resolve("../config/blockchain")];
delete require.cache[require.resolve("../services/blockchainService")];

const pool = require("../config/database");
const { votingContract } = require("../config/blockchain");
const {
    registerCandidateOnBlockchain,
    authorizeVoterOnBlockchain,
} = require("../services/blockchainService");

const POSTGRES_ELECTION_ID = 14;
const BLOCKCHAIN_ELECTION_ID = "1";
const VOTER_USER_ID = 1;

async function main() {
    const candidatesResult = await pool.query(
        `SELECT name, party, symbol, manifesto
         FROM candidates WHERE election_id = $1 ORDER BY id`,
        [POSTGRES_ELECTION_ID]
    );

    const voterResult = await pool.query(
        `SELECT id, name, wallet_address FROM users WHERE id = $1`,
        [VOTER_USER_ID]
    );

    const voter = voterResult.rows[0];

    const existing = await votingContract.getCandidates(BLOCKCHAIN_ELECTION_ID);
    if (Number(existing.length) === 0) {
        for (const candidate of candidatesResult.rows) {
            console.log(`Registering candidate: ${candidate.name}`);
            await registerCandidateOnBlockchain(
                BLOCKCHAIN_ELECTION_ID,
                candidate.name,
                candidate.party || "",
                candidate.symbol || "",
                candidate.manifesto || ""
            );
        }
    } else {
        console.log(`Chain already has ${existing.length} candidate(s).`);
    }

    const alreadyAuthorized = await votingContract.authorizedVoters(
        BLOCKCHAIN_ELECTION_ID,
        voter.wallet_address
    );

    let authResult = null;

    if (!alreadyAuthorized) {
        console.log(`Authorizing voter ${voter.wallet_address}...`);
        authResult = await authorizeVoterOnBlockchain(
            BLOCKCHAIN_ELECTION_ID,
            voter.wallet_address
        );
    } else {
        console.log("Voter already authorized on-chain.");
    }

    await pool.query(
        `UPDATE elections
         SET blockchain_election_id = $1,
             contract_address = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [BLOCKCHAIN_ELECTION_ID, process.env.EVOTING_CONTRACT_ADDRESS, POSTGRES_ELECTION_ID]
    );

    await pool.query(
        `DELETE FROM voter_election_authorizations
         WHERE election_id = $1 AND user_id = $2`,
        [POSTGRES_ELECTION_ID, VOTER_USER_ID]
    );

    await pool.query(
        `INSERT INTO voter_election_authorizations
            (user_id, election_id, is_authorized, has_voted, authorized_at)
         VALUES ($1, $2, TRUE, FALSE, NOW())`,
        [VOTER_USER_ID, POSTGRES_ELECTION_ID]
    );

    const onChainAuth = await votingContract.authorizedVoters(
        BLOCKCHAIN_ELECTION_ID,
        voter.wallet_address
    );

    const chainCandidates = await votingContract.getCandidates(BLOCKCHAIN_ELECTION_ID);

    console.log(JSON.stringify({
        success: true,
        postgresElectionId: POSTGRES_ELECTION_ID,
        blockchainElectionId: BLOCKCHAIN_ELECTION_ID,
        candidateCountOnChain: chainCandidates.length,
        voterAuthorizedOnChain: onChainAuth,
        authorizationTx: authResult?.transactionHash || null,
    }, null, 2));

    await pool.end();
}

main().catch(async (error) => {
    console.error("Complete resync failed:", error.message);
    try {
        await pool.end();
    } catch {
        // ignore
    }
    process.exit(1);
});
