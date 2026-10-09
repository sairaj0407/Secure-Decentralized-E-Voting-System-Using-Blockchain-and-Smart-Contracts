const pool = require("../config/database");

async function checkAll() {
    try {
        const res = await pool.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE column_name LIKE '%election_id%' 
               OR table_name = 'elections'
            ORDER BY table_name
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
checkAll();
