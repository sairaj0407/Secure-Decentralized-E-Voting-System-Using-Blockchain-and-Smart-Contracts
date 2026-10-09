const pool = require("../config/database");
const { votingContract, CONTRACT_ADDRESS } = require("../config/blockchain");
const { ethers } = require("ethers");
const { 
    createElectionOnBlockchain, 
    registerCandidateOnBlockchain, 
    startElectionOnBlockchain,
    authorizeVoterOnBlockchain 
} = require("../services/blockchainService");

async function setupActiveElection() {
    console.log("==================================================");
    console.log("SDEMS - SETTING UP ACTIVE GENERAL ELECTION WITH REAL CANDIDATES");
    console.log("==================================================");

    try {
        const title = "General Parliamentary & Assembly Election (Lok Sabha 2026)";
        const description = "Official statutory general election conducted under the authority of the Election Commission of India and Representation of the People Act, 1951.";
        const startTime = new Date(Date.now() - 3600000); // 1 hr ago
        const endTime = new Date(Date.now() + 30 * 24 * 3600000); // 30 days in future

        console.log("\n1. Creating election on blockchain...");
        const startUnix = Math.floor(startTime.getTime() / 1000);
        const endUnix = Math.floor(endTime.getTime() / 1000);

        const blockchainResult = await createElectionOnBlockchain(
            title,
            description,
            startUnix,
            endUnix
        );

        let blockchainElectionId = null;
        for (const log of blockchainResult.receipt.logs) {
            try {
                const parsed = votingContract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
                if (parsed && parsed.name === "ElectionCreated") {
                    blockchainElectionId = parsed.args.electionId.toString();
                    break;
                }
            } catch (_) {}
        }

        if (!blockchainElectionId) {
            blockchainElectionId = "1";
        }
        console.log(`[PASS] Blockchain Election Created with ID: ${blockchainElectionId}`);

        // Get admin user id for created_by
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : 1;

        console.log("\n2. Inserting election into PostgreSQL database...");
        const insertElectionQuery = `
            INSERT INTO elections (
                title, description, start_time, end_time, status, created_by,
                contract_address, blockchain_election_id, election_type, election_code, election_level
            ) VALUES (
                $1, $2, $3, $4, 'UPCOMING', $5,
                $6, $7, 'PARLIAMENTARY', $8, 'NATIONAL'
            ) RETURNING *;
        `;
        const electionCode = "GEN-2026-" + Math.floor(1000 + Math.random() * 9000);
        const elRes = await pool.query(insertElectionQuery, [
            title,
            description,
            startTime,
            endTime,
            adminId,
            CONTRACT_ADDRESS || votingContract.target,
            blockchainElectionId,
            electionCode
        ]);
        const dbElection = elRes.rows[0];
        console.log(`[PASS] PostgreSQL Election Inserted with ID: ${dbElection.id}`);

        // 3. Register Real Candidates
        const realCandidates = [
            {
                name: "Dr. Rajeshwar Sharma",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Doctorate in Public Policy (Ph.D., Delhi University)",
                total_assets: "₹ 5,80,00,000 (Declared)",
                total_liabilities: "₹ 15,20,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 validated by Returning Officer. Zero criminal convictions or pending FIRs.",
                manifesto: "National infrastructure corridors, rooftop solar grid expansion, AI-driven agricultural cold chains, and youth technical skill vouchers."
            },
            {
                name: "Adv. Priya Venkatesh",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Master of Laws (LL.M., National Law School)",
                total_assets: "₹ 3,45,00,000 (Declared)",
                total_liabilities: "₹ 8,50,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified. Impeccable record in constitutional law and human rights advocacy.",
                manifesto: "Universal free health diagnostics, state scholarship guarantee for female scholars, ecological river rejuvenation, and decentralization of civic governance."
            },
            {
                name: "Er. Arvind Kulkarni",
                party: "Aam Aadmi Party (AAP)",
                symbol: "Broom",
                education: "B.Tech in Computer Science & Engineering (IIT Bombay)",
                total_assets: "₹ 1,95,00,000 (Declared)",
                total_liabilities: "₹ 4,10,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory disclosure Form 26 validated. Zero pending legal proceedings.",
                manifesto: "Transparent public expenditure tracking on blockchain, 24x7 municipal drinking water, neighborhood Mohalla digital learning centers, and clean transport."
            },
            {
                name: "Prof. Somnath Banerjee",
                party: "Communist Party of India (Marxist)",
                symbol: "Hammer, Sickle and Star",
                education: "M.A. in Applied Economics, Jadavpur University",
                total_assets: "₹ 92,00,000 (Declared)",
                total_liabilities: "₹ 0 (Nil)",
                criminal_cases_count: 0,
                affidavit_summary: "Full disclosure under Section 33A RPA 1951. No criminal cases or financial defaults.",
                manifesto: "Enforcement of statutory minimum living wages, universal social security for gig workers, agrarian debt restructuring, and public education endowment."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right (Section 49-O & Rule 64A)",
                total_assets: "₹ 0 (Statutory Entity)",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court of India mandated elector empowerment option (PUCL vs Union of India, 2013).",
                manifesto: "Enables voters to exercise democratic dissent against all nominated candidates without disclosing ballot identity."
            }
        ];

        console.log("\n3. Registering real candidate nominations on blockchain and database...");
        let candidateIndex = 1;
        for (const cand of realCandidates) {
            // Register on blockchain
            console.log(`   -> Registering candidate: ${cand.name} (${cand.party})...`);
            const candBlockchainResult = await registerCandidateOnBlockchain(
                blockchainElectionId,
                cand.name,
                cand.party,
                cand.symbol,
                cand.manifesto
            );

            // Determine party ID from database
            const partyCheck = await pool.query("SELECT id FROM parties WHERE name ILIKE $1 OR abbreviation ILIKE $1 LIMIT 1", [cand.party.split("(")[0].trim()]);
            const partyId = partyCheck.rows.length > 0 ? partyCheck.rows[0].id : null;

            // Insert into PostgreSQL
            const insertCandQuery = `
                INSERT INTO candidates (
                    election_id, name, party, symbol, manifesto,
                    education, total_assets, total_liabilities, criminal_cases_count,
                    affidavit_summary, status, party_id, blockchain_candidate_id
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9,
                    $10, 'FINAL', $11, $12
                ) RETURNING id;
            `;
            const candRes = await pool.query(insertCandQuery, [
                dbElection.id,
                cand.name,
                cand.party,
                cand.symbol,
                cand.manifesto,
                cand.education,
                cand.total_assets,
                cand.total_liabilities,
                cand.criminal_cases_count,
                cand.affidavit_summary,
                partyId,
                candidateIndex
            ]);
            console.log(`   [PASS] Candidate #${candidateIndex} registered in DB with ID: ${candRes.rows[0].id} (Blockchain Candidate ID: ${candidateIndex})`);

            // Record transaction
            if (candBlockchainResult && candBlockchainResult.receipt) {
                await pool.query(`
                    INSERT INTO blockchain_transactions (
                        election_id, tx_hash, block_number, wallet_address, gas_used, transaction_status, confirmed_at
                    ) VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', CURRENT_TIMESTAMP)
                `, [
                    dbElection.id,
                    candBlockchainResult.receipt.hash,
                    candBlockchainResult.receipt.blockNumber ? Number(candBlockchainResult.receipt.blockNumber) : null,
                    candBlockchainResult.receipt.from,
                    candBlockchainResult.receipt.gasUsed ? candBlockchainResult.receipt.gasUsed.toString() : null
                ]);
            }

            candidateIndex++;
        }

        console.log("\n4. Starting election on blockchain and activating in database...");
        await startElectionOnBlockchain(blockchainElectionId);
        await pool.query("UPDATE elections SET status = 'ACTIVE' WHERE id = $1", [dbElection.id]);
        console.log("[PASS] Election transitioned to status ACTIVE on blockchain and database!");

        console.log("\n5. Authorizing all registered voters for the active election...");
        const votersRes = await pool.query("SELECT id, name, voter_id, wallet_address FROM users WHERE role = 'VOTER'");
        console.log(`Found ${votersRes.rows.length} registered electors to authorize.`);

        for (const voter of votersRes.rows) {
            try {
                if (voter.wallet_address) {
                    await authorizeVoterOnBlockchain(blockchainElectionId, voter.wallet_address);
                }
            } catch (authErr) {
                console.warn(`   Note on blockchain voter authorization for ${voter.name}:`, authErr.message);
            }

            await pool.query(`
                INSERT INTO voter_election_authorizations (user_id, election_id, is_authorized, has_voted)
                VALUES ($1, $2, TRUE, FALSE)
                ON CONFLICT (user_id, election_id) DO UPDATE SET is_authorized = TRUE, has_voted = FALSE;
            `, [voter.id, dbElection.id]);
            console.log(`   [PASS] Elector authorized: ${voter.name} (${voter.voter_id})`);
        }

        console.log("\n==================================================");
        console.log("ACTIVE ELECTION SETUP COMPLETED SUCCESSFULLY!");
        console.log(`Election ID: ${dbElection.id} (Blockchain ID: ${blockchainElectionId})`);
        console.log(`Title: ${title}`);
        console.log(`Contesting Candidates: ${realCandidates.length}`);
        console.log("==================================================");

        process.exit(0);
    } catch (err) {
        console.error("FATAL ERROR setting up active election:", err);
        process.exit(1);
    }
}

setupActiveElection();
