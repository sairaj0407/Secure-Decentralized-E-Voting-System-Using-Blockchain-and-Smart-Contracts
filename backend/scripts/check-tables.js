require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");

(async () => {
    try {
        console.log("Checking tables in database...");
        const result = await pool.query(
            `SELECT table_name 
             FROM information_schema.tables 
             WHERE table_schema = 'public' 
             ORDER BY table_name`
        );
        console.log("Tables:");
        for (const row of result.rows) {
            console.log(`- ${row.table_name}`);
            const colsResult = await pool.query(
                `SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = $1`,
                [row.table_name]
            );
            colsResult.rows.forEach(col => {
                console.log(`    * ${col.column_name} (${col.data_type})`);
            });
        }
    } catch (err) {
        console.error("Error checking tables:", err);
    } finally {
        await pool.end();
    }
})();
