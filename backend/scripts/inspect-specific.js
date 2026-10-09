const pool = require('../config/database');

async function run() {
    try {
        console.log("=== USERS ===");
        const users = await pool.query(`
            SELECT id, name, email, role, voter_id, phone, status, is_verified, 
                   constituency_id, polling_station_id, state_id, district_id 
            FROM users 
            ORDER BY id
        `);
        console.table(users.rows);

        console.log("\n=== ELECTION OFFICERS ===");
        const officers = await pool.query(`SELECT id, official_name, designation, office_location, phone, email, status FROM election_officers ORDER BY id`);
        console.table(officers.rows);

        console.log("\n=== GRIEVANCES ===");
        const grievances = await pool.query(`SELECT id, complainant_name, category, description, status FROM grievances ORDER BY id`);
        console.table(grievances.rows);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

run();
