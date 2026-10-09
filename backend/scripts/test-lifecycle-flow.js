require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");
const { votingContract } = require("../config/blockchain");

// Import controllers
const { createElection, startElection, endElection, publishResults } = require("../controllers/electionController");
const { addCandidate } = require("../controllers/candidateController");
const { castVote } = require("../controllers/voteController");
const { getElectionResults } = require("../controllers/resultController");

// Mock Response Helper
const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = function(code) {
        this.statusCode = code;
        return this;
    };
    res.json = function(data) {
        this.jsonData = data;
        return this;
    };
    return res;
};

async function checkOnChainStatus(blockchainElectionId) {
    const election = await votingContract.getElection(blockchainElectionId);
    return Number(election.status);
}

async function main() {
    try {
        console.log("==================================================");
        console.log("STARTING ELECTION LIFECYCLE INTEGRATION TEST");
        console.log("==================================================");

        let ELECTION_ID = null;
        let blockchainElectionId = null;
        let candidateId = null;
        let candidateName = null;

        // Query elections linked to blockchain to find an UPCOMING candidate
        const electionRes = await pool.query(
            "SELECT id, blockchain_election_id FROM elections WHERE blockchain_election_id IS NOT NULL ORDER BY id DESC"
        );

        for (const row of electionRes.rows) {
            try {
                const status = await checkOnChainStatus(Number(row.blockchain_election_id));
                if (status === 1) { // UPCOMING
                    const candidateRes = await pool.query(
                        "SELECT id, name FROM candidates WHERE election_id = $1 ORDER BY id ASC",
                        [row.id]
                    );
                    if (candidateRes.rows.length >= 2) {
                        ELECTION_ID = row.id;
                        blockchainElectionId = Number(row.blockchain_election_id);
                        candidateId = candidateRes.rows[0].id;
                        candidateName = candidateRes.rows[0].name;
                        break;
                    }
                }
            } catch (err) {
                // Ignore stale records
            }
        }

        // If no ready UPCOMING election found, create a fresh one on-chain and in DB
        if (!ELECTION_ID) {
            console.log("No existing UPCOMING election found on-chain. Auto-provisioning fresh test election...");
            const reqCreate = {
                body: {
                    title: `Automated Integration Poll ${Date.now()}`,
                    description: "Statutory automated lifecycle test poll",
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    endTime: new Date(Date.now() + 7200000).toISOString()
                },
                user: { userId: 2, role: "ADMIN" }
            };
            const resCreate = mockRes();
            await createElection(reqCreate, resCreate);
            if (resCreate.statusCode !== 201) {
                throw new Error("Failed to auto-create test election: " + resCreate.jsonData?.message);
            }
            ELECTION_ID = resCreate.jsonData.election.id;
            blockchainElectionId = Number(resCreate.jsonData.election.blockchain_election_id);
            console.log(`Auto-created test Election ID: ${ELECTION_ID} (On-Chain ID: ${blockchainElectionId})`);

            // Register Candidate 1
            const resCand1 = mockRes();
            await addCandidate({
                body: { electionId: ELECTION_ID, name: "Candidate Alpha", party: "Bharatiya Janata Party", symbol: "Lotus" },
                user: { userId: 2, role: "ADMIN" }
            }, resCand1);
            candidateId = resCand1.jsonData.candidate.id;
            candidateName = resCand1.jsonData.candidate.name;

            // Register Candidate 2
            const resCand2 = mockRes();
            await addCandidate({
                body: { electionId: ELECTION_ID, name: "Candidate Beta", party: "Indian National Congress", symbol: "Hand" },
                user: { userId: 2, role: "ADMIN" }
            }, resCand2);
        }

        console.log(`Resolved Election ID: ${ELECTION_ID} matches On-Chain ID: ${blockchainElectionId}`);
        console.log(`Resolved Candidate ID: ${candidateId} (${candidateName})`);

        // Reset state for testing if needed
        // Since we want to test active lifecycle, let's first check status.
        // If it was already active/ended/etc., we might need to reset PostgreSQL status to DRAFT or UPCOMING.
        // To be safe and clean, let's reset the status of the election to 'UPCOMING' in PostgreSQL,
        // and check what the status is on-chain. If it's already active/ended, we can reset or log it.
        // Wait, on-chain status is UPCOMING (1). So we can reset PostgreSQL to UPCOMING.
        await pool.query(
            "UPDATE elections SET status = 'UPCOMING', start_time = NOW() - INTERVAL '1 hour', end_time = NOW() + INTERVAL '2 hours' WHERE id = $1",
            [ELECTION_ID]
        );
        
        // Also clear any previous votes in DB to start clean
        await pool.query("DELETE FROM votes WHERE election_id = $1", [ELECTION_ID]);
        await pool.query("UPDATE voter_election_authorizations SET has_voted = FALSE, voted_at = NULL WHERE election_id = $1", [ELECTION_ID]);
        await pool.query("DELETE FROM blockchain_transactions WHERE election_id = $1 AND tx_hash NOT IN (SELECT tx_hash FROM blockchain_transactions WHERE election_id = $1 LIMIT 2)", [ELECTION_ID]); // Keep deploy / candidate registrations, delete voting txs

        console.log("PostgreSQL state initialized to UPCOMING for testing.");

        // --------------------------------------------------------
        // STEP 3: START ELECTION
        // --------------------------------------------------------
        console.log("\n--- STEP 3: START ELECTION ---");
        const initialOnChainStatus = await checkOnChainStatus(blockchainElectionId);
        console.log("Initial On-Chain Status:", initialOnChainStatus);

        if (initialOnChainStatus === 1) { // UPCOMING
            const reqStart = {
                params: { id: ELECTION_ID.toString() },
                user: { userId: 2, role: "ADMIN" } // Admin user
            };
            const resStart = mockRes();
            await startElection(reqStart, resStart);

            console.log("Response Code:", resStart.statusCode);
            console.log("Response Body:", JSON.stringify(resStart.jsonData, null, 2));

            if (resStart.statusCode !== 200) {
                throw new Error(`Start election failed: ${resStart.jsonData?.message}`);
            }
        } else if (initialOnChainStatus === 2) {
            console.log("Election is already ACTIVE on-chain. Updating PostgreSQL to ACTIVE and skipping start transaction.");
            await pool.query("UPDATE elections SET status = 'ACTIVE' WHERE id = $1", [ELECTION_ID]);
        } else {
            console.log(`Election is in status ${initialOnChainStatus} on-chain. We cannot run active lifecycle tests.`);
            return;
        }

        const onChainStatusAfterStart = await checkOnChainStatus(blockchainElectionId);
        console.log("On-Chain Status (expect 2 - ACTIVE):", onChainStatusAfterStart);
        if (onChainStatusAfterStart !== 2) {
            throw new Error("On-chain election status is not ACTIVE!");
        }
        console.log("SUCCESS: Election started on-chain and in PostgreSQL.");

        // Fast-forward blockchain time to match/exceed start_time if necessary
        console.log("\n--- OPTIONAL: FAST-FORWARD BLOCKCHAIN TIME ---");
        const provider = votingContract.runner.provider;
        const election = await votingContract.getElection(blockchainElectionId);
        const startTimeOnChain = Number(election.startTime);
        const latestBlock = await provider.getBlock("latest");
        const currentTimestamp = latestBlock.timestamp;
        
        if (currentTimestamp < startTimeOnChain) {
            const timeDiff = startTimeOnChain - currentTimestamp + 10;
            console.log(`Current block timestamp is ${currentTimestamp}. Election start time is ${startTimeOnChain}.`);
            console.log(`Increasing blockchain time by ${timeDiff} seconds...`);
            await provider.send("evm_increaseTime", [timeDiff]);
            await provider.send("evm_mine", []);
            const newBlock = await provider.getBlock("latest");
            console.log("New block timestamp:", newBlock.timestamp);
        } else {
            console.log("Blockchain time is already within the voting window.");
        }

        // --------------------------------------------------------
        // STEP 4: CAST A REAL VOTE
        // --------------------------------------------------------
        console.log("\n--- STEP 4: CAST A REAL VOTE ---");
        const voterRes = await pool.query(
            "SELECT id, name, wallet_address FROM users WHERE role = 'VOTER' AND is_verified = TRUE AND is_active = TRUE LIMIT 1"
        );
        if (voterRes.rows.length === 0) {
            throw new Error("No verified voter found in database.");
        }
        const voterUserId = Number(voterRes.rows[0].id);
        console.log(`Using verified test voter ID ${voterUserId} (${voterRes.rows[0].name})`);

        const reqVote = {
            body: { electionId: ELECTION_ID, candidateId: candidateId },
            user: { userId: voterUserId, role: "VOTER" }
        };
        const resVote = mockRes();
        await castVote(reqVote, resVote);

        console.log("Response Code:", resVote.statusCode);
        console.log("Response Body:", JSON.stringify(resVote.jsonData, null, 2));

        if (resVote.statusCode !== 201) {
            throw new Error(`Cast vote failed: ${resVote.jsonData?.message}`);
        }

        const txHash = resVote.jsonData.blockchain.transactionHash;
        console.log("SUCCESS: Vote cast on-chain. Tx Hash:", txHash);

        // --------------------------------------------------------
        // STEP 5 & 6: VERIFY BLOCKCHAIN TX & POSTGRES SYNC
        // --------------------------------------------------------
        console.log("\n--- STEP 5 & 6: VERIFY BLOCKCHAIN TX & POSTGRES SYNC ---");
        
        // Check votes table
        const votesInDb = await pool.query(
            "SELECT * FROM votes WHERE election_id = $1 AND voter_id = $2",
            [ELECTION_ID, voterUserId]
        );
        console.log("Votes in DB:", votesInDb.rows.length);
        if (votesInDb.rows.length !== 1) {
            throw new Error("Vote not found in PostgreSQL!");
        }
        console.log("Vote record in Postgres:", {
            id: votesInDb.rows[0].id,
            candidate_id: votesInDb.rows[0].candidate_id,
            tx_hash: votesInDb.rows[0].tx_hash,
            block_number: votesInDb.rows[0].block_number
        });

        // Check authorizations table
        const authInDb = await pool.query(
            "SELECT is_authorized, has_voted, voted_at FROM voter_election_authorizations WHERE election_id = $1 AND user_id = $2",
            [ELECTION_ID, voterUserId]
        );
        console.log("Authorization has_voted status in Postgres (expect true):", authInDb.rows[0].has_voted);
        if (!authInDb.rows[0].has_voted) {
            throw new Error("Voter authorization not updated to has_voted = true in PostgreSQL!");
        }

        // Check transaction recorded in blockchain_transactions
        const txInDb = await pool.query(
            "SELECT * FROM blockchain_transactions WHERE tx_hash = $1",
            [txHash]
        );
        console.log("Tx found in blockchain_transactions:", txInDb.rows.length > 0);
        if (txInDb.rows.length === 0) {
            throw new Error("Transaction hash not saved in blockchain_transactions table!");
        }

        console.log("SUCCESS: Blockchain transaction and Postgres states are fully synchronized.");

        // --------------------------------------------------------
        // STEP 7: TEST DUPLICATE VOTING PREVENTION
        // --------------------------------------------------------
        console.log("\n--- STEP 7: TEST DUPLICATE VOTING PREVENTION ---");
        const resDuplicateVote = mockRes();
        await castVote(reqVote, resDuplicateVote);

        console.log("Response Code:", resDuplicateVote.statusCode);
        console.log("Response Body:", JSON.stringify(resDuplicateVote.jsonData, null, 2));

        if (resDuplicateVote.statusCode === 201) {
            throw new Error("Duplicate vote was incorrectly allowed!");
        }
        console.log("SUCCESS: Duplicate vote was rejected with code:", resDuplicateVote.statusCode);

        // --------------------------------------------------------
        // STEP 8: TEST UNAUTHORIZED / UNVERIFIED VOTING PREVENTION
        // --------------------------------------------------------
        console.log("\n--- STEP 8: TEST UNAUTHORIZED / UNVERIFIED VOTING PREVENTION ---");
        const unverifiedRes = await pool.query(
            "SELECT id FROM users WHERE is_verified = FALSE AND role = 'VOTER' LIMIT 1"
        );
        let unverifiedUserId;
        if (unverifiedRes.rows.length > 0) {
            unverifiedUserId = Number(unverifiedRes.rows[0].id);
        } else {
            const ins = await pool.query(
                `INSERT INTO users (name, email, password_hash, role, is_verified, is_active)
                 VALUES ('Unverified Citizen', 'unverified_${Date.now()}@eci.test', 'hash123', 'VOTER', FALSE, TRUE)
                 RETURNING id`
            );
            unverifiedUserId = Number(ins.rows[0].id);
        }

        const reqUnauthorizedVote = {
            body: { electionId: ELECTION_ID, candidateId: candidateId },
            user: { userId: unverifiedUserId, role: "VOTER" }
        };
        const resUnauthorizedVote = mockRes();
        await castVote(reqUnauthorizedVote, resUnauthorizedVote);

        console.log("Response Code:", resUnauthorizedVote.statusCode);
        console.log("Response Body:", JSON.stringify(resUnauthorizedVote.jsonData, null, 2));

        if (resUnauthorizedVote.statusCode === 201) {
            throw new Error("Unauthorized vote was incorrectly allowed!");
        }
        console.log("SUCCESS: Unauthorized vote was rejected with code:", resUnauthorizedVote.statusCode);

        // --------------------------------------------------------
        // STEP 9: END ELECTION
        // --------------------------------------------------------
        console.log("\n--- STEP 9: END ELECTION ---");
        const reqEnd = {
            params: { id: ELECTION_ID.toString() },
            user: { userId: 2, role: "ADMIN" }
        };
        const resEnd = mockRes();
        await endElection(reqEnd, resEnd);

        console.log("Response Code:", resEnd.statusCode);
        console.log("Response Body:", JSON.stringify(resEnd.jsonData, null, 2));

        if (resEnd.statusCode !== 200) {
            throw new Error(`End election failed: ${resEnd.jsonData?.message}`);
        }

        const onChainStatusAfterEnd = await checkOnChainStatus(blockchainElectionId);
        console.log("On-Chain Status (expect 3 - ENDED):", onChainStatusAfterEnd);
        if (onChainStatusAfterEnd !== 3) {
            throw new Error("On-chain election status is not ENDED!");
        }
        console.log("SUCCESS: Election ended on-chain and in PostgreSQL.");

        // --------------------------------------------------------
        // STEP 10: CALCULATE RESULTS
        // --------------------------------------------------------
        console.log("\n--- STEP 10: CALCULATE RESULTS ---");
        // Update election status to RESULTS_PUBLISHED in PostgreSQL temporarily to test getElectionResults
        // because getElectionResults checks if status === 'RESULTS_PUBLISHED'
        await pool.query("UPDATE elections SET status = 'RESULTS_PUBLISHED' WHERE id = $1", [ELECTION_ID]);
        
        const reqResults = {
            params: { electionId: ELECTION_ID.toString() }
        };
        const resResults = mockRes();
        await getElectionResults(reqResults, resResults);

        console.log("Response Code:", resResults.statusCode);
        console.log("Response Body:", JSON.stringify(resResults.jsonData, null, 2));

        const dbRes = resResults.jsonData.databaseResults;
        const bcRes = resResults.jsonData.blockchainResults;

        const winner = dbRes.candidates.reduce((highest, candidate) => 
            candidate.votes > (highest ? highest.votes : -1) ? candidate : highest, null);
        console.log("Winner:", winner?.name);

        if (Number(dbRes.totalVotes) !== 1 || Number(bcRes.totalVotes) !== 1) {
            throw new Error("Vote count mismatch in results!");
        }
        if (winner?.name !== candidateName) {
            throw new Error("Incorrect winner calculated!");
        }
        console.log("SUCCESS: Results correctly calculated and verified on-chain.");

        // Restore status to ENDED for step 11
        await pool.query("UPDATE elections SET status = 'ENDED' WHERE id = $1", [ELECTION_ID]);

        // --------------------------------------------------------
        // STEP 11: PUBLISH RESULTS
        // --------------------------------------------------------
        console.log("\n--- STEP 11: PUBLISH RESULTS ---");
        const reqPublish = {
            params: { id: ELECTION_ID.toString() },
            user: { userId: 2, role: "ADMIN" }
        };
        const resPublish = mockRes();
        await publishResults(reqPublish, resPublish);

        console.log("Response Code:", resPublish.statusCode);
        console.log("Response Body:", JSON.stringify(resPublish.jsonData, null, 2));

        if (resPublish.statusCode !== 200) {
            throw new Error(`Publish results failed: ${resPublish.jsonData?.message}`);
        }

        const onChainStatusAfterPublish = await checkOnChainStatus(blockchainElectionId);
        console.log("On-Chain Status (expect 4 - RESULTS_PUBLISHED):", onChainStatusAfterPublish);
        if (onChainStatusAfterPublish !== 4) {
            throw new Error("On-chain election status is not RESULTS_PUBLISHED!");
        }
        console.log("SUCCESS: Results published on-chain and in PostgreSQL.");

        console.log("\n==================================================");
        console.log("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!");
        console.log("==================================================");

    } catch (error) {
        console.error("\nTEST FAILED:", error);
    } finally {
        await pool.end();
    }
}

main();
