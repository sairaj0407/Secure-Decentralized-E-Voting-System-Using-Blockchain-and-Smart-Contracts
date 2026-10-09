const pool = require("../config/database");
const { createElectionOnBlockchain } = require("../services/blockchainService");
const { votingContract, CONTRACT_ADDRESS } = require("../config/blockchain");

async function debug() {
    try {
        console.log("=== CHECK CONSTRAINTS ON ELECTIONS ===");
        const cRes = await pool.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as def 
            FROM pg_constraint 
            WHERE conrelid = 'elections'::regclass
        `);
        console.table(cRes.rows);

        console.log("=== CHECK ADMIN USERS IN DB ===");
        const uRes = await pool.query(`
            SELECT id, email, role FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSIONER')
        `);
        console.table(uRes.rows);

        const adminId = uRes.rows[0]?.id;
        console.log("Using Admin ID:", adminId);

        console.log("=== TEST SIMULATING createElection ===");
        const title = "Debug Election " + Date.now();
        const start = new Date(Date.now() + 60000);
        const end = new Date(Date.now() + 3600000);

        const startTimestamp = Math.floor(start.getTime() / 1000);
        const endTimestamp = Math.floor(end.getTime() / 1000);

        console.log("Calling createElectionOnBlockchain...");
        const blockchainResult = await createElectionOnBlockchain(
            title,
            "",
            startTimestamp,
            endTimestamp
        );
        console.log("Blockchain tx hash:", blockchainResult.transactionHash);

        const receipt = blockchainResult.receipt;
        let blockchainElectionId = null;
        if (receipt.logs && receipt.logs.length > 0) {
            for (const log of receipt.logs) {
                try {
                    const parsedLog = votingContract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    });
                    if (parsedLog && parsedLog.name === "ElectionCreated") {
                        blockchainElectionId = parsedLog.args.electionId.toString();
                        break;
                    }
                } catch (e) {}
            }
        }
        console.log("blockchainElectionId:", blockchainElectionId);

        console.log("Inserting into elections table...");
        const result = await pool.query(
            `INSERT INTO elections
                (
                    title,
                    description,
                    start_time,
                    end_time,
                    status,
                    created_by,
                    contract_address,
                    blockchain_election_id
                )
             VALUES
                ($1, $2, $3, $4, 'DRAFT', $5, $6, $7)
             RETURNING *`,
            [
                title,
                null,
                start,
                end,
                adminId,
                CONTRACT_ADDRESS,
                blockchainElectionId
            ]
        );
        console.log("Inserted election successfully:", result.rows[0].id);

        console.log("Testing blockchain_transactions insert...");
        const blockNumber = receipt.blockNumber ? Number(receipt.blockNumber) : null;
        const gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : null;

        await pool.query(
            `INSERT INTO blockchain_transactions
            (
                election_id,
                tx_hash,
                block_number,
                wallet_address,
                gas_used,
                transaction_status,
                confirmed_at
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                result.rows[0].id,
                blockchainResult.transactionHash,
                blockNumber,
                process.env.BLOCKCHAIN_ADMIN_ADDRESS,
                gasUsed,
                "CONFIRMED"
            ]
        );
        console.log("Inserted blockchain_transactions successfully");

        console.log("Testing audit_logs insert...");
        await pool.query(
            `INSERT INTO audit_logs
                (user_id, action, description)
             VALUES
                ($1, $2, $3)`,
            [
                adminId,
                "ELECTION_CREATED",
                `Election "${title}" was created.`
            ]
        );
        console.log("Inserted audit_logs successfully");

    } catch (err) {
        console.error("DEBUG ERROR CAUGHT:", err);
    } finally {
        await pool.end();
    }
}

debug();
