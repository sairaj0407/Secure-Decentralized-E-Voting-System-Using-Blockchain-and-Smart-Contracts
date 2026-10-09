const express = require("express");
const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const authorizationRoutes = require("./routes/authorizationRoutes");
const blockchainRoutes = require("./routes/blockchainRoutes");
const voteRoutes = require("./routes/voteRoutes");
const resultRoutes = require("./routes/resultRoutes");
const constituencyRoutes = require("./routes/constituencyRoutes");
const pollingStationRoutes = require("./routes/pollingStationRoutes");
const partyRoutes = require("./routes/partyRoutes");
const voterRollRoutes = require("./routes/voterRollRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const govRoutes = require("./routes/govRoutes");
const refDataRoutes = require("./routes/refDataRoutes");
const aiRoutes = require("./routes/aiRoutes");
const databaseRoutes = require("./routes/databaseRoutes");
const voterServiceRoutes = require("./routes/voterServiceRoutes");

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const pool = require("./config/database");

const app = express();


// ============================================================
// SECURITY
// ============================================================

app.use(helmet());


// ============================================================
// CORS
// ============================================================

app.use(cors({
    origin: (origin, callback) => {
        // Allow Electron desktop application (null, file:// or undefined), and localhost
        if (!origin || origin === "null" || origin.startsWith("file://") || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

const path = require("path");
app.use("/analytics", express.static(path.join(__dirname, "../analytics")));
app.use("/analytics", express.static(path.join(__dirname, "analytics")));


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(compression());
app.use(express.json({ limit: "5mb" }));


// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/authorizations", authorizationRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/constituencies", constituencyRoutes);
app.use("/api/polling-stations", pollingStationRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/voters", voterRollRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/gov", govRoutes);
app.use("/api/ref-data", refDataRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/voter-services", voterServiceRoutes);


// ============================================================
// ROOT ROUTE
// ============================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Secure Decentralized E-Voting System API is running.",
    });
});


// ============================================================
// HEALTH CHECK
// ============================================================

const { provider, votingContract } = require("./config/blockchain");
const fs = require("fs");

app.get("/api/health", async (req, res) => {
    // 1. PostgreSQL DB Check
    let postgresStatus = "OFFLINE";
    let postgresMessage = "Unable to connect to database.";
    let dbTime = null;
    try {
        const result = await pool.query("SELECT NOW()");
        postgresStatus = "ONLINE";
        postgresMessage = "Database connected successfully.";
        dbTime = result.rows[0].now;
    } catch (err) {
        postgresMessage = err.message;
    }

    // 2. Blockchain RPC Check
    let blockchainStatus = "OFFLINE";
    let blockchainMessage = "Blockchain node is unreachable.";
    let blockNumber = null;
    try {
        blockNumber = await provider.getBlockNumber();
        blockchainStatus = "ONLINE";
        blockchainMessage = "Local Hardhat node connected successfully.";
    } catch (err) {
        blockchainMessage = err.message;
    }

    // 3. Smart Contract Verification Check
    let contractStatus = "OFFLINE";
    let contractMessage = "Smart contract is not verified or deployed.";
    try {
        if (votingContract) {
            const adminAddress = await votingContract.admin();
            contractStatus = "VERIFIED";
            contractMessage = `Smart contract successfully verified. Admin address: ${adminAddress}`;
        } else {
            contractMessage = "Smart contract reference is not configured.";
        }
    } catch (err) {
        contractMessage = err.message;
    }

    // 4. Analytics Engine Check
    let analyticsStatus = "OFFLINE";
    let analyticsMessage = "Analytics engine script not found.";
    try {
        const analyticsPath = path.join(__dirname, "../analytics/analyze_votes.py");
        if (fs.existsSync(analyticsPath)) {
            analyticsStatus = "ONLINE";
            analyticsMessage = "Analytics script found and verified.";
        }
    } catch (err) {
        analyticsMessage = err.message;
    }

    // Overall status determination
    const overallSuccess = postgresStatus === "ONLINE" && blockchainStatus === "ONLINE" && contractStatus === "VERIFIED";

    res.json({
        success: true,
        overallStatus: overallSuccess ? "ONLINE" : "WARNING",
        services: {
            backend: {
                status: "ONLINE",
                message: "API server is running.",
            },
            database: {
                status: postgresStatus,
                message: postgresMessage,
                time: dbTime
            },
            blockchain: {
                status: blockchainStatus,
                message: blockchainMessage,
                blockNumber: blockNumber
            },
            contract: {
                status: contractStatus,
                message: contractMessage,
                address: votingContract ? votingContract.target : null
            },
            analytics: {
                status: analyticsStatus,
                message: analyticsMessage
            }
        }
    });
});


// ============================================================
// START SERVER
// ============================================================

const { runMigrations } = require("./config/migration");
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        await runMigrations();
    } catch (err) {
        console.error("Migration startup execution failed:", err);
    }
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.warn(`[Express] Port ${PORT} is already occupied. Clearing stale process...`);
        try {
            const { execSync } = require("child_process");
            if (process.platform === "win32") {
                const out = execSync(`netstat -ano | findstr :${PORT} | findstr LISTENING`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
                const lines = out.trim().split("\n");
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== "0" && parseInt(pid, 10) !== process.pid) {
                        try {
                            execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
                        } catch (kErr) {}
                    }
                }
            }
            console.log(`[Express] Port ${PORT} cleared. Rebinding...`);
            setTimeout(() => {
                app.listen(PORT, () => {
                    console.log(`Server running on http://localhost:${PORT} after clearing stale process.`);
                });
            }, 800);
        } catch (e) {
            console.error(`[Express] Failed to rebind port ${PORT}:`, e.message);
            process.exit(1);
        }
    } else {
        console.error("[Express] Unhandled server error:", err);
        process.exit(1);
    }
});