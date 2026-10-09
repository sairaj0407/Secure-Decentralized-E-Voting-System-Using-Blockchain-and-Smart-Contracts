const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const pool = require("../config/database");

const backupDatabase = async (req, res) => {
    const backupDir = path.join(__dirname, "../..");
    const backupPath = path.join(backupDir, "db_backup.dump");
    const jsonBackupPath = path.join(backupDir, "db_backup.json");
    const env = {
        ...process.env,
        PGPASSWORD: process.env.DB_PASSWORD
    };

    // Attempt pg_dump first
    const cmd = `pg_dump -h ${process.env.DB_HOST || "localhost"} -p ${process.env.DB_PORT || 5432} -U ${process.env.DB_USER || "postgres"} -d ${process.env.DB_NAME || "evoting_db"} -F c -b -v -f "${backupPath}"`;

    exec(cmd, { env }, async (err, stdout, stderr) => {
        if (!err) {
            return res.json({ success: true, message: "PostgreSQL Database binary archive generated successfully.", path: backupPath, backup: backupPath });
        }

        // Programmatic JSON Fallback
        try {
            console.log("[Settings] pg_dump CLI unavailable, falling back to database table JSON export...");
            const tables = [
                "users", "elections", "candidates", "votes", "constituencies", 
                "polling_stations", "reference_parties", "grievances", "compliance_violations",
                "audit_logs", "voter_receipts", "voter_election_authorizations"
            ];
            const snapshot = {
                timestamp: new Date().toISOString(),
                database: process.env.DB_NAME || "evoting_db",
                tables: {}
            };

            for (const table of tables) {
                try {
                    const result = await pool.query(`SELECT * FROM ${table}`);
                    snapshot.tables[table] = result.rows;
                } catch (tErr) {
                    snapshot.tables[table] = [];
                }
            }

            fs.writeFileSync(jsonBackupPath, JSON.stringify(snapshot, null, 2), "utf8");
            return res.json({
                success: true,
                message: "PostgreSQL Database JSON snapshot generated successfully.",
                path: jsonBackupPath,
                backup: jsonBackupPath,
                tablesIncluded: Object.keys(snapshot.tables).length
            });
        } catch (fbErr) {
            console.error("[Settings] Fallback backup failed:", fbErr);
            return res.status(500).json({ success: false, message: `Database backup failed: ${fbErr.message}` });
        }
    });
};

const restoreDatabase = async (req, res) => {
    const backupPath = path.join(__dirname, "../../db_backup.dump");
    const jsonBackupPath = path.join(__dirname, "../../db_backup.json");

    if (fs.existsSync(backupPath)) {
        const env = {
            ...process.env,
            PGPASSWORD: process.env.DB_PASSWORD
        };
        const cmd = `pg_restore -c -h ${process.env.DB_HOST || "localhost"} -p ${process.env.DB_PORT || 5432} -U ${process.env.DB_USER || "postgres"} -d ${process.env.DB_NAME || "evoting_db"} -v "${backupPath}"`;

        exec(cmd, { env }, (err, stdout, stderr) => {
            if (err && !stderr.includes("errors ignored") && !stderr.includes("WARNING")) {
                return res.status(500).json({ success: false, message: `PostgreSQL restore failed: ${err.message}` });
            }
            return res.json({ success: true, message: "PostgreSQL Database restored successfully from binary dump." });
        });
        return;
    }

    if (fs.existsSync(jsonBackupPath)) {
        return res.json({ success: true, message: "Found valid database JSON snapshot ready for inspection." });
    }

    return res.status(404).json({ success: false, message: "No backup dump file (db_backup.dump or db_backup.json) was found." });
};

const { votingContract } = require("../config/blockchain");

const runAnalytics = async (req, res) => {
    const pythonScript = path.join(__dirname, "../../analytics/analyze_votes.py");
    const cmd = `python "${pythonScript}"`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error("[Settings] Python analytics failed:", stderr);
            return res.status(500).json({ success: false, message: `Python analytics run failed: ${err.message}` });
        }
        res.json({ success: true, message: "Python analytics engine completed successfully.", output: stdout });
    });
};

const getReconciliation = async (req, res) => {
    try {
        const electionsRes = await pool.query("SELECT id, title, blockchain_election_id, status FROM elections");
        const reports = [];

        for (const election of electionsRes.rows) {
            let blockchainStatus = "UNKNOWN";
            let blockchainVoteCount = 0;
            let matchStatus = "MATCH";
            let details = "";

            const dbVotesRes = await pool.query("SELECT COUNT(*) FROM votes WHERE election_id = $1", [election.id]);
            const dbVoteCount = parseInt(dbVotesRes.rows[0].count);

            if (election.blockchain_election_id && votingContract) {
                try {
                    const bcElection = await votingContract.getElection(election.blockchain_election_id);
                    blockchainVoteCount = Number(bcElection.voteCount || 0);
                    
                    const stateMapping = ["DRAFT", "UPCOMING", "ACTIVE", "ENDED", "RESULTS_PUBLISHED"];
                    blockchainStatus = stateMapping[Number(bcElection.state || 0)] || "UNKNOWN";

                    if (dbVoteCount === blockchainVoteCount) {
                        matchStatus = "MATCH";
                    } else if (dbVoteCount > blockchainVoteCount) {
                        matchStatus = "DATABASE_ONLY";
                        details = "Database contains votes not yet synced or processed on blockchain.";
                    } else {
                        matchStatus = "BLOCKCHAIN_ONLY";
                        details = "Blockchain contains votes missing from local PostgreSQL database.";
                    }
                } catch (bcErr) {
                    blockchainStatus = "OFFLINE";
                    matchStatus = "MISMATCH";
                    details = bcErr.message;
                }
            } else {
                matchStatus = "DATABASE_ONLY";
                details = "Election is not linked to blockchain.";
            }

            reports.push({
                id: election.id,
                title: election.title,
                blockchainElectionId: election.blockchain_election_id,
                databaseStatus: election.status,
                blockchainStatus,
                databaseVoteCount: dbVoteCount,
                blockchainVoteCount,
                matchStatus,
                details
            });
        }

        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { backupDatabase, restoreDatabase, runAnalytics, getReconciliation };
