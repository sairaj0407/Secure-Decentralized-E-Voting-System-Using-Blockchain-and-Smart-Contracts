const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { ethers } = require("ethers");
const pool = require("../config/database");
const { votingContract, CONTRACT_ADDRESS, adminWallet } = require("../config/blockchain");
const {
  createElectionOnBlockchain,
  registerCandidateOnBlockchain,
  startElectionOnBlockchain
} = require("../services/blockchainService");

async function main() {
  console.log("=================================================");
  console.log("SDEMS: Resyncing Users & Active Elections to Contract");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Admin Wallet:", adminWallet ? adminWallet.address : "NULL");
  console.log("=================================================");

  // 1. Assign wallet addresses to all users who have null wallet_address
  const nullUsers = await pool.query("SELECT id, name, voter_id, email FROM users WHERE wallet_address IS NULL");
  console.log(`Found ${nullUsers.rows.length} users with null wallet_address.`);
  for (const u of nullUsers.rows) {
    const newWallet = ethers.Wallet.createRandom().address;
    await pool.query("UPDATE users SET wallet_address = $1, is_verified = TRUE, is_active = TRUE WHERE id = $2", [newWallet, u.id]);
    console.log(`Assigned wallet ${newWallet} to user ${u.id} (${u.name} / ${u.voter_id || u.email})`);
  }

  // Ensure SAIRAJ (504060) and NIKET (504048) are verified and active
  await pool.query("UPDATE users SET is_verified = TRUE, is_active = TRUE WHERE voter_id IN ('504060', '504048')");

  // 2. Sync Election 54 ('sk')
  const el54Res = await pool.query("SELECT * FROM elections WHERE id = 54");
  if (el54Res.rows.length > 0) {
    const el54 = el54Res.rows[0];
    console.log(`\nSyncing Election 54 ('${el54.title}') to new contract...`);
    
    const startTs = Math.floor(Date.now() / 1000) - 300;
    const endTs = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days in future

    // Create on new blockchain contract
    const createRes = await createElectionOnBlockchain(
      el54.title,
      el54.description || "General Election",
      startTs,
      endTs
    );
    console.log(`Election created on-chain. Tx: ${createRes.transactionHash}`);

    // Parse election ID from receipt logs
    let newBlockchainElectionId = 1;
    for (const log of createRes.receipt.logs) {
      try {
        const parsed = votingContract.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed && parsed.name === "ElectionCreated") {
          newBlockchainElectionId = Number(parsed.args[0]);
          break;
        }
      } catch {}
    }
    console.log(`New Blockchain Election ID: ${newBlockchainElectionId}`);

    // Fetch DB candidates for election 54
    const candRes = await pool.query("SELECT * FROM candidates WHERE election_id = 54 ORDER BY id ASC");
    console.log(`Registering ${candRes.rows.length} candidates on-chain...`);

    let cIdx = 1;
    for (const c of candRes.rows) {
      const regCand = await registerCandidateOnBlockchain(
        newBlockchainElectionId,
        c.name,
        c.party || "",
        c.symbol || "",
        c.manifesto || ""
      );
      await pool.query(
        "UPDATE candidates SET blockchain_candidate_id = $1 WHERE id = $2",
        [cIdx, c.id]
      );
      console.log(`Candidate #${cIdx} '${c.name}' registered. Tx: ${regCand.transactionHash}`);
      cIdx++;
    }

    // Start election on-chain
    const startRes = await startElectionOnBlockchain(newBlockchainElectionId);
    console.log(`Election started on-chain. Tx: ${startRes.transactionHash}`);

    // Update election 54 in DB
    await pool.query(
      `UPDATE elections 
       SET contract_address = $1, 
           blockchain_election_id = $2, 
           status = 'ACTIVE',
           start_time = TO_TIMESTAMP($3),
           end_time = TO_TIMESTAMP($4)
       WHERE id = 54`,
      [CONTRACT_ADDRESS, newBlockchainElectionId, startTs, endTs]
    );
    console.log("Election 54 updated in PostgreSQL with new contract and ACTIVE status.");

    // Enroll all verified active voters for election 54
    await pool.query(
      `INSERT INTO voter_election_authorizations (user_id, election_id, is_authorized, authorized_at)
       SELECT u.id, 54, TRUE, NOW()
       FROM users u
       WHERE u.role = 'VOTER' AND u.is_verified = TRUE AND u.is_active = TRUE
       ON CONFLICT (user_id, election_id) DO NOTHING`
    );
    console.log(`Enrolled verified voters into Election 54 authorizations.`);
  }

  console.log("\n=================================================");
  console.log("Sync completed successfully!");
  console.log("=================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("Sync error:", err);
  process.exit(1);
});
