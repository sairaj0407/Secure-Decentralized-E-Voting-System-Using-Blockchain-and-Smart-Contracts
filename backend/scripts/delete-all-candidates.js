const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function deleteAllCandidates() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log("Connecting to PostgreSQL...");
    // Check current count
    const initialCand = await pool.query("SELECT COUNT(*) FROM candidates");
    console.log(`Initial candidate count: ${initialCand.rows[0].count}`);

    // Remove any test votes referencing candidates
    await pool.query("DELETE FROM votes");
    console.log("Cleared dependent test votes.");

    // Delete all candidates
    const res = await pool.query("DELETE FROM candidates");
    console.log(`Deleted ${res.rowCount} candidates.`);

    // Reset sequence if exists
    try {
      await pool.query("ALTER SEQUENCE candidates_id_seq RESTART WITH 1");
      console.log("Reset candidates_id_seq to 1.");
    } catch (seqErr) {
      console.log("No candidates_id_seq to reset or alternate sequence type.");
    }

    const finalCand = await pool.query("SELECT COUNT(*) FROM candidates");
    console.log(`Final candidate count: ${finalCand.rows[0].count}`);
    console.log("Candidate deletion completed successfully.");
  } catch (err) {
    console.error("Error deleting candidates:", err);
  } finally {
    await pool.end();
  }
}

deleteAllCandidates();
