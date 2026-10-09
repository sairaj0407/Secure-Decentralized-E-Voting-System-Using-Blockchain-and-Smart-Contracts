const pool = require("../config/database");

async function deleteAllElections() {
    const client = await pool.connect();
    try {
        console.log("Starting election deletion transaction...");
        await client.query("BEGIN");

        // 1. Delete dependent child records
        const votesRes = await client.query("DELETE FROM votes");
        console.log(`Deleted ${votesRes.rowCount} votes.`);

        const receiptsRes = await client.query("DELETE FROM voter_receipts");
        console.log(`Deleted ${receiptsRes.rowCount} voter_receipts.`);

        const authRes = await client.query("DELETE FROM voter_election_authorizations");
        console.log(`Deleted ${authRes.rowCount} voter_election_authorizations.`);

        const repollsRes = await client.query("DELETE FROM repolls");
        console.log(`Deleted ${repollsRes.rowCount} repolls.`);

        const phasesRes = await client.query("DELETE FROM election_phases");
        console.log(`Deleted ${phasesRes.rowCount} election_phases.`);

        const statsRes = await client.query("DELETE FROM reference_election_statistics");
        console.log(`Deleted ${statsRes.rowCount} reference_election_statistics.`);

        const txRes = await client.query("DELETE FROM blockchain_transactions WHERE election_id IS NOT NULL");
        console.log(`Deleted ${txRes.rowCount} blockchain_transactions.`);

        const candRes = await client.query("DELETE FROM candidates");
        console.log(`Deleted ${candRes.rowCount} candidates.`);

        // 2. Delete all elections
        const electRes = await client.query("DELETE FROM elections");
        console.log(`Deleted ${electRes.rowCount} elections.`);

        // 3. Reset sequences
        try {
            await client.query("ALTER SEQUENCE elections_id_seq RESTART WITH 1");
            console.log("Reset elections_id_seq to 1.");
        } catch (e) {
            console.log("elections_id_seq restart notice:", e.message);
        }

        try {
            await client.query("ALTER SEQUENCE candidates_id_seq RESTART WITH 1");
            console.log("Reset candidates_id_seq to 1.");
        } catch (e) {
            console.log("candidates_id_seq restart notice:", e.message);
        }

        await client.query("COMMIT");
        console.log("ALL elections deleted successfully and committed to database!");

        // Verify counts
        const countRes = await client.query("SELECT COUNT(*) FROM elections");
        console.log("Remaining elections count:", countRes.rows[0].count);

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error deleting elections:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

deleteAllElections();
