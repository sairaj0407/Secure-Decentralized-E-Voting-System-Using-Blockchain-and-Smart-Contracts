require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");

(async () => {
    const election = await pool.query(
        "SELECT id, title, status, blockchain_election_id, contract_address FROM elections WHERE id = 14"
    );
    const candidates = await pool.query(
        "SELECT id, name, party, symbol FROM candidates WHERE election_id = 14 ORDER BY id"
    );
    const voters = await pool.query(
        "SELECT id, name, email, wallet_address, is_verified FROM users WHERE role = 'VOTER' ORDER BY id LIMIT 10"
    );
    const admins = await pool.query(
        "SELECT id, name, email FROM users WHERE role = 'ADMIN' LIMIT 5"
    );
    const authorizations = await pool.query(
        "SELECT * FROM voter_election_authorizations WHERE election_id = 14"
    );

    console.log(JSON.stringify({
        election: election.rows,
        candidates: candidates.rows,
        voters: voters.rows,
        admins: admins.rows,
        authorizations: authorizations.rows,
    }, null, 2));

    await pool.end();
})().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
