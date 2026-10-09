require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");
const { votingContract, CONTRACT_ADDRESS, provider, adminWallet } = require("../config/blockchain");
const {
    createElectionOnBlockchain,
    registerCandidateOnBlockchain,
    startElectionOnBlockchain,
    authorizeVoterOnBlockchain
} = require("../services/blockchainService");

async function syncElection1() {
    console.log("================================================================================");
    console.log("SDEMS ON-CHAIN SYNCHRONIZER: STATUTORY GENERAL ELECTION 1");
    console.log("================================================================================");
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Admin Wallet:", adminWallet ? adminWallet.address : "NULL");

    // 1. Check if Election 1 already exists on-chain
    let existsOnChain = false;
    try {
        const onChainEl = await votingContract.getElection(1);
        if (onChainEl && onChainEl.exists) {
            existsOnChain = true;
            console.log(`[STATUS] Election 1 already exists on chain: '${onChainEl.title}' (Status: ${onChainEl.status.toString()})`);
        }
    } catch (err) {
        console.log("[STATUS] Election 1 does not exist on chain yet. Initializing on-chain record...");
    }

    let onChainId = 1;

    if (!existsOnChain) {
        // Query Election 1 from DB
        const elRes = await pool.query("SELECT * FROM elections WHERE id = 1");
        if (elRes.rows.length === 0) {
            throw new Error("Election 1 not found in PostgreSQL database!");
        }
        const dbElection = elRes.rows[0];

        const startTs = Math.floor(Date.now() / 1000) - 3600; // 1 hr ago
        const endTs = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days future

        console.log("\n1. Deploying Election 1 to EVM Smart Contract...");
        const createRes = await createElectionOnBlockchain(
            dbElection.title,
            dbElection.description || "General Statutory Election",
            startTs,
            endTs
        );
        console.log(`[PASS] Election created on-chain. Tx: ${createRes.transactionHash}`);

        // Register candidates
        const candRes = await pool.query("SELECT * FROM candidates WHERE election_id = 1 ORDER BY id ASC");
        console.log(`\n2. Registering ${candRes.rows.length} statutory candidates on-chain...`);

        let cIdx = 1;
        for (const c of candRes.rows) {
            const regRes = await registerCandidateOnBlockchain(
                onChainId,
                c.name,
                c.party || "Independent",
                c.symbol || "Symbol",
                c.manifesto || "Official statutory electoral manifesto"
            );
            await pool.query("UPDATE candidates SET blockchain_candidate_id = $1 WHERE id = $2", [cIdx, c.id]);
            console.log(`[PASS] Registered candidate #${cIdx} '${c.name}' on-chain. Tx: ${regRes.transactionHash}`);
            cIdx++;
        }

        // Start election on-chain
        console.log("\n3. Starting Election 1 on-chain...");
        const startRes = await startElectionOnBlockchain(onChainId);
        console.log(`[PASS] Election 1 activated on-chain. Tx: ${startRes.transactionHash}`);

        // Update database with new on-chain ID
        await pool.query(`
            UPDATE elections
            SET blockchain_election_id = $1,
                contract_address = $2,
                status = 'ACTIVE',
                start_time = TO_TIMESTAMP($3),
                end_time = TO_TIMESTAMP($4)
            WHERE id = 1
        `, [onChainId.toString(), CONTRACT_ADDRESS, startTs, endTs]);
        console.log("[PASS] Updated Election 1 in PostgreSQL (blockchain_election_id = 1, status = ACTIVE).");
    }

    // 4. Ensure all users have valid wallet addresses and assign on-chain authorization
    console.log("\n4. Auditing voter wallets and authorizations...");
    const voters = await pool.query("SELECT id, name, voter_id, email, wallet_address FROM users WHERE role = 'VOTER'");
    const { ethers } = require("ethers");

    for (const v of voters.rows) {
        let wallet = v.wallet_address;
        if (!wallet || !ethers.isAddress(wallet)) {
            wallet = ethers.Wallet.createRandom().address;
            await pool.query("UPDATE users SET wallet_address = $1, is_verified = TRUE, is_active = TRUE WHERE id = $2", [wallet, v.id]);
            console.log(`[PASS] Assigned wallet ${wallet} to elector ${v.name} (${v.voter_id})`);
        }

        // Check if authorized on-chain
        try {
            const isAuth = await votingContract.isVoterAuthorized(onChainId, wallet);
            if (!isAuth) {
                console.log(`Authorizing elector ${v.name} (${wallet}) on-chain for Election ${onChainId}...`);
                await authorizeVoterOnBlockchain(onChainId, wallet);
                console.log(`[PASS] Elector ${v.name} authorized on-chain.`);
            } else {
                console.log(`[PASS] Elector ${v.name} is already authorized on-chain.`);
            }
        } catch (e) {
            console.warn(`[WARN] Could not verify on-chain authorization for ${v.name}:`, e.message);
        }

        // Ensure record exists in voter_election_authorizations
        const authRecord = await pool.query(
            "SELECT id FROM voter_election_authorizations WHERE election_id = 1 AND user_id = $1",
            [v.id]
        );
        if (authRecord.rows.length === 0) {
            await pool.query(`
                INSERT INTO voter_election_authorizations (
                    election_id, user_id, is_authorized, authorized_at
                ) VALUES (
                    1, $1, TRUE, NOW()
                )
            `, [v.id]);
            console.log(`[PASS] Elector ${v.name} recorded in voter_election_authorizations table.`);
        }
    }

    console.log("\n================================================================================");
    console.log("SYNCHRONIZATION COMPLETED SUCCESSFULLY!");
    console.log("================================================================================");
    await pool.end();
}

syncElection1().catch(e => {
    console.error("Fatal error during sync:", e);
    process.exit(1);
});
