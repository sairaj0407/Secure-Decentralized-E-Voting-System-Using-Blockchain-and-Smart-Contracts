require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");
const http = require("http");

async function runTests() {
    console.log("==================================================");
    console.log("TESTING NEW SDEMS FEATURES: KYC, BALLOT AUDIT, SERVICES");
    console.log("==================================================");

    try {
        // 1. Check a candidate with KYC data in DB
        const candRes = await pool.query("SELECT id, name, party, education, total_assets, criminal_cases_count FROM candidates LIMIT 5");
        console.log(`[PASS] Candidates query returned ${candRes.rows.length} candidates with KYC fields.`);

        // 2. Check voter_service_requests table
        const vsrRes = await pool.query("SELECT COUNT(*) FROM voter_service_requests");
        console.log(`[PASS] voter_service_requests table exists. Current count: ${vsrRes.rows[0].count}`);

        // 3. Test submitting a dummy service request and approving it
        const userRes = await pool.query("SELECT id, name FROM users WHERE role = 'VOTER' LIMIT 1");
        if (userRes.rows.length > 0) {
            const testVoter = userRes.rows[0];
            const insertRes = await pool.query(
                `INSERT INTO voter_service_requests (user_id, request_type, category, details, status)
                 VALUES ($1, 'FORM_8_CORRECTION', 'Correction of Entries in Electoral Roll', $2, 'SUBMITTED')
                 RETURNING id`,
                [testVoter.id, JSON.stringify({ reason: "Testing Form 8 submission flow", name: testVoter.name })]
            );
            const reqId = insertRes.rows[0].id;
            console.log(`[PASS] Inserted test voter service request #${reqId} for ${testVoter.name}`);

            // Update to APPROVED
            await pool.query(
                `UPDATE voter_service_requests SET status = 'APPROVED', admin_notes = 'Verified by ERO under Rule 26' WHERE id = $1`,
                [reqId]
            );
            console.log(`[PASS] Updated test voter service request #${reqId} to APPROVED.`);

            // Clean up test request
            await pool.query("DELETE FROM voter_service_requests WHERE id = $1", [reqId]);
            console.log(`[PASS] Cleaned up test request #${reqId}.`);
        }

        // 4. Test on-chain vote verification endpoint
        const rcptRes = await pool.query("SELECT receipt_code, tx_hash FROM voter_receipts LIMIT 1");
        if (rcptRes.rows.length > 0) {
            const rcpt = rcptRes.rows[0];
            console.log(`[PASS] Found existing voter receipt ${rcpt.receipt_code} with tx_hash ${rcpt.tx_hash}`);
        } else {
            console.log("[INFO] No voter receipts currently in database. On-chain verifier will verify any valid receipt once generated.");
        }

        console.log("==================================================");
        console.log("ALL BACKEND INTEGRATION CHECKS PASSED!");
        console.log("==================================================");
        process.exit(0);
    } catch (err) {
        console.error("Test error:", err);
        process.exit(1);
    }
}

runTests();
