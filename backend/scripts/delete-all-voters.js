const pool = require("../config/database");

async function deleteAllRegisteredVoters() {
    const client = await pool.connect();
    try {
        console.log("[DB Maintenance] Starting deletion of all registered voters...");
        await client.query("BEGIN");

        // 1. Check current count of voters
        const countBefore = await client.query("SELECT COUNT(*) AS total_voters FROM users WHERE role = 'VOTER'");
        console.log(`[DB Maintenance] Current registered voters in database: ${countBefore.rows[0].total_voters}`);

        // 2. Reassign any elections where created_by was assigned to a voter account to Admin ID 1
        const adminRes = await client.query("SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id ASC LIMIT 1");
        const fallbackAdminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : null;
        if (fallbackAdminId) {
            const reassignElections = await client.query(
                "UPDATE elections SET created_by = $1 WHERE created_by IN (SELECT id FROM users WHERE role = 'VOTER')",
                [fallbackAdminId]
            );
            console.log(`[DB Maintenance] Reassigned ${reassignElections.rowCount} elections created by voter accounts to ECI Admin (ID: ${fallbackAdminId})`);
        }

        // 3. Clear phone verification records
        const pvRes = await client.query("DELETE FROM phone_verifications");
        console.log(`[DB Maintenance] Cleared ${pvRes.rowCount} phone verification records.`);

        // 4. Temporarily disable audit log trigger to allow foreign key ON DELETE SET NULL to execute without mutating audit log entries
        console.log("[DB Maintenance] Temporarily lifting audit immutability trigger for referential cleanup...");
        await client.query("ALTER TABLE audit_logs DISABLE TRIGGER audit_log_immutability_trigger");

        // 5. Delete all users with role 'VOTER' (cascades to votes, voter_receipts, voter_election_authorizations, grievances)
        const delRes = await client.query("DELETE FROM users WHERE role = 'VOTER'");
        console.log(`[DB Maintenance] Successfully deleted ${delRes.rowCount} registered voter accounts from users table.`);

        // 6. Re-enable audit log immutability trigger immediately
        await client.query("ALTER TABLE audit_logs ENABLE TRIGGER audit_log_immutability_trigger");
        console.log("[DB Maintenance] Audit log immutability trigger successfully re-enabled.");

        // 7. Clean up any dynamic test additions from uidai_aadhaar_registry (keep standard 4 official seed records)
        const uidaiCleanup = await client.query("DELETE FROM uidai_aadhaar_registry WHERE id > 4");
        console.log(`[DB Maintenance] Cleaned ${uidaiCleanup.rowCount} temporary UIDAI registry test entries.`);

        await client.query("COMMIT");

        // 8. Verify post-deletion state
        const countAfter = await client.query("SELECT COUNT(*) AS total_voters FROM users WHERE role = 'VOTER'");
        const totalRemainingUsers = await client.query("SELECT role, COUNT(*) AS count FROM users GROUP BY role");

        console.log("==================================================");
        console.log(`[DB Maintenance] Registered voters remaining: ${countAfter.rows[0].total_voters}`);
        console.log("[DB Maintenance] Remaining official authority/admin accounts in database:");
        console.table(totalRemainingUsers.rows);
        console.log("==================================================");
        console.log("[DB Maintenance] Complete: All registered voters have been safely deleted.");
    } catch (err) {
        try {
            await client.query("ALTER TABLE audit_logs ENABLE TRIGGER audit_log_immutability_trigger");
        } catch (_) {}
        await client.query("ROLLBACK");
        console.error("[DB Maintenance] Error during voter deletion, transaction rolled back:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

deleteAllRegisteredVoters();
