const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { ethers } = require("ethers");
const { votingContract } = require("../config/blockchain");

async function main() {
  console.log("==================================================================");
  console.log("SDEMS — END-TO-END VOTING EXECUTION & STATUTORY VVPAT AUDIT SUITE");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;
  function assert(condition, desc) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  const BASE_URL = "http://localhost:5000/api";

  // -------------------------------------------------------------
  // PHASE 1: VOTER 1 (SAIRAJ, voter_id: 504060)
  // -------------------------------------------------------------
  console.log("\n--- PHASE 1: VOTER 'SAIRAJ' (504060) LOGIN & BALLOT ---");

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voterId: "504060",
      password: "Sairaj@123"
    })
  });
  const loginData = await loginRes.json();
  assert(loginRes.ok && loginData.success, `Voter 504060 authenticated successfully. Role: ${loginData.user?.role}`);
  const sairajToken = loginData.token;

  // Fetch Elections for SAIRAJ
  const electionsRes = await fetch(`${BASE_URL}/elections`, {
    headers: { Authorization: `Bearer ${sairajToken}` }
  });
  const electionsData = await electionsRes.json();
  assert(electionsRes.ok && electionsData.success, "Retrieved elections roster.");
  
  const el54 = electionsData.elections.find(e => e.id == 54);
  assert(el54 && el54.status === "ACTIVE", `Election 54 ('${el54?.title}') is ACTIVE.`);
  assert(el54 && el54.has_voted === false, "Election 54 initial has_voted is FALSE.");

  // Fetch Candidates for Election 54
  const candRes = await fetch(`${BASE_URL}/candidates/election/54`, {
    headers: { Authorization: `Bearer ${sairajToken}` }
  });
  const candData = await candRes.json();
  assert(candRes.ok && candData.success && candData.candidates.length >= 2, `Retrieved ${candData.candidates?.length} candidates for Election 54.`);
  const candidate1 = candData.candidates[0]; // 'ik'
  console.log(`  Selected Candidate: '${candidate1.name}' (ID: ${candidate1.id}, Party: ${candidate1.party})`);

  // Cast Vote for SAIRAJ (Relayer Mode - No client txHash needed)
  console.log("\n  -> Casting Vote via Official ECI Relayer...");
  const voteRes = await fetch(`${BASE_URL}/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sairajToken}`
    },
    body: JSON.stringify({
      electionId: 54,
      candidateId: candidate1.id
    })
  });
  const voteData = await voteRes.json();
  assert(voteRes.ok && voteData.success, `Vote cast successfully! Tx: ${voteData.blockchain?.transactionHash || voteData.receipt?.tx_hash}`);
  assert(!!voteData.receipt?.receipt_code, `Statutory Receipt Code generated: ${voteData.receipt?.receipt_code}`);
  assert(voteData.receipt?.candidate_name === candidate1.name, `Receipt candidate matches: ${voteData.receipt?.candidate_name}`);

  // Fetch Persisted Receipt
  const receiptRes = await fetch(`${BASE_URL}/votes/receipt/54`, {
    headers: { Authorization: `Bearer ${sairajToken}` }
  });
  const receiptData = await receiptRes.json();
  assert(receiptRes.ok && receiptData.success, "Fetched statutory receipt from /api/votes/receipt/54.");
  assert(receiptData.receipt?.receipt_code === voteData.receipt?.receipt_code, "Persisted receipt code matches ballot return code.");

  // Verify Election Status for SAIRAJ
  const electionsResAfter = await fetch(`${BASE_URL}/elections`, {
    headers: { Authorization: `Bearer ${sairajToken}` }
  });
  const electionsDataAfter = await electionsResAfter.json();
  const el54After = electionsDataAfter.elections.find(e => e.id == 54);
  assert(el54After && el54After.has_voted === true, "Election 54 has_voted is now TRUE for SAIRAJ.");
  assert(el54After && !!el54After.receipt_code, `Election 54 linked receipt code: ${el54After?.receipt_code}`);

  // Attempt Duplicate Vote for SAIRAJ
  console.log("\n  -> Testing Double-Voting Lockout for SAIRAJ...");
  const dupVoteRes = await fetch(`${BASE_URL}/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sairajToken}`
    },
    body: JSON.stringify({
      electionId: 54,
      candidateId: candData.candidates[1].id
    })
  });
  const dupVoteData = await dupVoteRes.json();
  assert(dupVoteRes.status === 409 && !dupVoteData.success, `Duplicate vote strictly rejected with HTTP 409 Conflict: "${dupVoteData.message}"`);

  // -------------------------------------------------------------
  // PHASE 2: VOTER 2 (SEEDED PAN-INDIA ELECTOR: DL00001)
  // -------------------------------------------------------------
  console.log("\n--- PHASE 2: SEEDED ELECTOR (DL00001) LOGIN & BALLOT ---");

  const dlLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voterId: "DL00001",
      password: "Sairaj@123"
    })
  });
  const dlLoginData = await dlLoginRes.json();
  assert(dlLoginRes.ok && dlLoginData.success, `Seeded elector DL00001 (${dlLoginData.user?.name}) authenticated.`);
  const dlToken = dlLoginData.token;

  const candidate2 = candData.candidates[1]; // 'rjebyr'
  console.log(`  Selected Candidate for DL00001: '${candidate2.name}' (ID: ${candidate2.id})`);

  // Cast Vote for DL00001
  const dlVoteRes = await fetch(`${BASE_URL}/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${dlToken}`
    },
    body: JSON.stringify({
      electionId: 54,
      candidateId: candidate2.id
    })
  });
  const dlVoteData = await dlVoteRes.json();
  assert(dlVoteRes.ok && dlVoteData.success, `DL00001 vote cast successfully! Tx: ${dlVoteData.blockchain?.transactionHash}`);
  assert(!!dlVoteData.receipt?.receipt_code, `DL00001 Receipt Code: ${dlVoteData.receipt?.receipt_code}`);

  // Attempt Duplicate Vote for DL00001
  const dlDupRes = await fetch(`${BASE_URL}/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${dlToken}`
    },
    body: JSON.stringify({
      electionId: 54,
      candidateId: candidate1.id
    })
  });
  assert(dlDupRes.status === 409, "DL00001 duplicate vote rejected with HTTP 409 Conflict.");

  // -------------------------------------------------------------
  // PHASE 3: ON-CHAIN CONSENSUS VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- PHASE 3: BLOCKCHAIN ON-CHAIN CONSENSUS VERIFICATION ---");

  const onChainCandidates = await votingContract.getCandidates(1);
  console.log(`  On-chain candidates count: ${onChainCandidates.length}`);
  const c1Votes = Number(onChainCandidates[0].voteCount);
  const c2Votes = Number(onChainCandidates[1].voteCount);
  const c3Votes = Number(onChainCandidates[2].voteCount);
  console.log(`  Candidate 1 ('${onChainCandidates[0].name}'): ${c1Votes} votes`);
  console.log(`  Candidate 2 ('${onChainCandidates[1].name}'): ${c2Votes} votes`);
  console.log(`  Candidate 3 ('${onChainCandidates[2].name}'): ${c3Votes} votes`);

  assert(c1Votes === 1, "Candidate 1 on-chain vote count is exactly 1.");
  assert(c2Votes === 1, "Candidate 2 on-chain vote count is exactly 1.");
  assert(c3Votes === 0, "Candidate 3 on-chain vote count is 0.");

  console.log("\n==================================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
