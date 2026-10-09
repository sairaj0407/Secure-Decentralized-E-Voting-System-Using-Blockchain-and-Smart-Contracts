const pool = require('../config/database');

async function run() {
    try {
        console.log("=== ELECTION OFFICERS ===");
        const offCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'election_officers'");
        console.log("Officers columns:", offCols.rows.map(r => r.column_name).join(", "));
        const officers = await pool.query("SELECT * FROM election_officers");
        console.table(officers.rows);

        console.log("\n=== ELECTION PHASES ===");
        const phases = await pool.query("SELECT * FROM election_phases ORDER BY phase_number");
        console.table(phases.rows);

        console.log("\n=== GRIEVANCES ===");
        const gri = await pool.query("SELECT * FROM grievances");
        console.table(gri.rows);

        console.log("\n=== VOTER SERVICE REQUESTS ===");
        const srv = await pool.query("SELECT * FROM voter_service_requests");
        console.table(srv.rows);

    } catch (err) {
        console.error("Inspect error:", err);
    } finally {
        await pool.end();
    }
}

run();
