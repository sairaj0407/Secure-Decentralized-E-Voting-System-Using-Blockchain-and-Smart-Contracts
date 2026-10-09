const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_POOL_MAX || "25", 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
    console.log("PostgreSQL connected successfully.");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

module.exports = pool;