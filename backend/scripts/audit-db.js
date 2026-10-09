const pool = require('../config/database');

async function run() {
    try {
        const tablesRes = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        );

        console.log("=== ALL DATABASE TABLES & ROW COUNTS ===");
        const tables = [];
        for (const row of tablesRes.rows) {
            const countRes = await pool.query('SELECT count(*) as c FROM "' + row.table_name + '"');
            tables.push({ table: row.table_name, count: parseInt(countRes.rows[0].c, 10) });
        }
        console.table(tables);

        console.log("\n=== CANDIDATES COLUMNS ===");
        const candCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'candidates' ORDER BY ordinal_position");
        console.table(candCols.rows);

        console.log("\n=== ALL CANDIDATES ===");
        const candidates = await pool.query("SELECT id, election_id, name, party, symbol, total_assets, education FROM candidates ORDER BY election_id, id");
        console.table(candidates.rows);

        console.log("\n=== USERS SUMMARY ===");
        const users = await pool.query("SELECT id, name, email, role, voter_id, phone, status, is_verified, constituency_id, polling_station_id FROM users ORDER BY id");
        console.table(users.rows);

        console.log("\n=== ELECTIONS WITH WEIRD / TEST / DEMO NAMES ===");
        const weirdElections = await pool.query("SELECT id, title, status, blockchain_election_id FROM elections WHERE length(title) < 10 OR title ILIKE '%test%' OR title ILIKE '%demo%' OR title ILIKE '%poll 17%' ORDER BY id");
        console.table(weirdElections.rows);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

run();
