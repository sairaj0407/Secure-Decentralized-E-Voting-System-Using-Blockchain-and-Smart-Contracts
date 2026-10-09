const { Pool } = require("pg");
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
        console.log("=== ELECTIONS ===");
        const elRes = await pool.query("SELECT id, title, status, blockchain_election_id FROM elections ORDER BY id DESC LIMIT 5");
        console.table(elRes.rows);

        console.log("=== CANDIDATES FOR ELECTION 14 ===");
        const candRes = await pool.query("SELECT id, name, party, symbol FROM candidates WHERE election_id = 14");
        console.table(candRes.rows);

        console.log("=== VOTER AUTHORIZATION FOR ELECTION 14 ===");
        const authRes = await pool.query("SELECT user_id, election_id, has_voted FROM voter_election_authorizations WHERE election_id = 14");
        console.table(authRes.rows);

        console.log("=== VOTES FOR ELECTION 14 ===");
        const votesRes = await pool.query("SELECT id, candidate_id, voter_id, tx_hash, block_number, wallet_address, gas_used, voted_at FROM votes WHERE election_id = 14");
        console.table(votesRes.rows);

        console.log("=== BLOCKCHAIN TRANSACTIONS FOR ELECTION 14 ===");
        const txRes = await pool.query("SELECT id, election_id, tx_hash, block_number, wallet_address, gas_used, transaction_status FROM blockchain_transactions WHERE election_id = 14");
        console.table(txRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
