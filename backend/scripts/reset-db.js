const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

(async () => {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log("Connecting to PostgreSQL...");
        await pool.query("SELECT NOW()");

        console.log("Truncating all database tables...");
        await pool.query("TRUNCATE TABLE audit_logs, blockchain_transactions, votes, voter_election_authorizations, candidates, elections, users RESTART IDENTITY CASCADE");

        console.log("Hashing password for ECI administrator...");
        const adminHash = await bcrypt.hash("GovOfIndia", 10);

        console.log("Inserting ECI Admin User...");
        const adminResult = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_verified, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            ["ECI Admin", "eci@gmail.com", adminHash, "ADMIN", true, true]
        );
        const adminId = adminResult.rows[0].id;
        console.log(`ECI Admin User inserted with ID: ${adminId}`);

        console.log("Database reset and seed completed successfully!");
    } catch (err) {
        console.error("Error during database reset/seed:", err);
    } finally {
        await pool.end();
    }
})();
