const pool = require('../config/database');

async function run() {
    try {
        console.log("=== 1. USERS DETAIL INSPECTION ===");
        const users = await pool.query(`
            SELECT id, name, email, role, voter_id, phone, dob, address, 
                   constituency_id, polling_station_id, gender, relative_name, 
                   relative_type, aadhaar_number, pincode, status, is_verified 
            FROM users 
            ORDER BY id
        `);
        console.table(users.rows);

        console.log("\n=== 2. ELECTIONS INSPECTION ===");
        const elections = await pool.query(`
            SELECT id, title, description, status, election_type, start_time, end_time, blockchain_election_id 
            FROM elections 
            ORDER BY id
        `);
        console.table(elections.rows);

        console.log("\n=== 3. CANDIDATES INSPECTION ===");
        const candidates = await pool.query(`
            SELECT id, election_id, name, party, symbol, education, total_assets, total_liabilities, criminal_cases_count, affidavit_summary 
            FROM candidates 
            ORDER BY election_id, id
        `);
        console.table(candidates.rows);

        console.log("\n=== 4. ELECTION OFFICERS INSPECTION ===");
        const officers = await pool.query(`SELECT * FROM election_officers ORDER BY id`);
        console.table(officers.rows);

        console.log("\n=== 5. ELECTION PHASES INSPECTION ===");
        const phases = await pool.query(`SELECT * FROM election_phases ORDER BY phase_number`);
        console.table(phases.rows);

        console.log("\n=== 6. GRIEVANCES INSPECTION ===");
        const grievances = await pool.query(`SELECT * FROM grievances ORDER BY id`);
        console.table(grievances.rows);

        console.log("\n=== 7. COMPLIANCE VIOLATIONS (MCC) ===");
        const mcc = await pool.query(`SELECT * FROM compliance_violations ORDER BY id`);
        console.table(mcc.rows);

        console.log("\n=== 8. INCIDENTS ===");
        const incidents = await pool.query(`SELECT * FROM incidents ORDER BY id`);
        console.table(incidents.rows);

    } catch (err) {
        console.error("Audit error:", err);
    } finally {
        await pool.end();
    }
}

run();
