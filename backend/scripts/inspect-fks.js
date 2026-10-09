const pool = require('../config/database');

async function run() {
    try {
        const fk = await pool.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'elections';
        `);
        console.table(fk.rows);

        // Check which election IDs are referenced in other tables
        const cands = await pool.query("SELECT DISTINCT election_id FROM candidates");
        console.log("Election IDs in candidates:", cands.rows.map(r => r.election_id));

        const votes = await pool.query("SELECT DISTINCT election_id FROM votes");
        console.log("Election IDs in votes:", votes.rows.map(r => r.election_id));

        const receipts = await pool.query("SELECT DISTINCT election_id FROM voter_receipts");
        console.log("Election IDs in voter_receipts:", receipts.rows.map(r => r.election_id));

        const auths = await pool.query("SELECT DISTINCT election_id FROM voter_election_authorizations");
        console.log("Election IDs in voter_election_authorizations:", auths.rows.map(r => r.election_id));

    } catch (err) {
        console.error("FK error:", err);
    } finally {
        await pool.end();
    }
}

run();
