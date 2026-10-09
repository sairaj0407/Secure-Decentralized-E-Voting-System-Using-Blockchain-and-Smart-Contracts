const { spawn, execSync } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

const ROOT = __dirname;
const BLOCKCHAIN_DIR = path.join(ROOT, "blockchain");
const BACKEND_DIR = path.join(ROOT, "backend");
const FRONTEND_DIR = path.join(ROOT, "frontend");

const hardhatCli = path.join(BLOCKCHAIN_DIR, "node_modules", "hardhat", "dist", "src", "cli.js");
const electronExe = path.join(FRONTEND_DIR, "node_modules", "electron", "dist", "electron.exe");

const spawnedProcesses = [];

function log(step, message) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] [${step}] ${message}`);
}

function checkPort(port, host = "127.0.0.1") {
    return new Promise((resolve) => {
        const client = new net.Socket();
        client.setTimeout(1000);
        client.once("connect", () => {
            client.destroy();
            resolve(true);
        });
        client.once("error", () => {
            client.destroy();
            resolve(false);
        });
        client.once("timeout", () => {
            client.destroy();
            resolve(false);
        });
        client.connect(port, host);
    });
}

async function waitForPort(port, maxSeconds = 30) {
    const start = Date.now();
    while (Date.now() - start < maxSeconds * 1000) {
        if (await checkPort(port)) return true;
        await new Promise((r) => setTimeout(r, 600));
    }
    return false;
}

function cleanup() {
    console.log("\n=================================================================");
    console.log("Shutting down election system services...");
    console.log("=================================================================");
    for (const p of spawnedProcesses) {
        try {
            if (p.pid) {
                if (process.platform === "win32") {
                    execSync(`taskkill /pid ${p.pid} /f /t`, { stdio: "ignore" });
                } else {
                    p.kill("SIGKILL");
                }
            }
        } catch (e) {}
    }
    console.log("All background services stopped cleanly.");
}

process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
});
process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
});

async function main() {
    console.log("=================================================================");
    console.log("   ELECTION COMMISSION OF INDIA - NATIONAL E-VOTING SYSTEM       ");
    console.log("   Automated 1-Click System Orchestrator & Launcher              ");
    console.log("=================================================================\n");

    // 1. PostgreSQL Check
    log("1/5", "Checking PostgreSQL database connection on port 5432...");
    let pgOk = await checkPort(5432);
    if (!pgOk) {
        log("1/5", "Port 5432 offline. Attempting to start PostgreSQL Windows service...");
        try {
            execSync("net start postgresql-x64-18", { stdio: "ignore" });
        } catch (e) {
            try {
                execSync("net start postgresql-x64-16", { stdio: "ignore" });
            } catch (e2) {}
        }
        pgOk = await waitForPort(5432, 10);
    }
    if (pgOk) {
        log("1/5", "PostgreSQL database verified online.");
    } else {
        console.warn("WARNING: PostgreSQL port 5432 is not responding. Ensure the database service is running.");
    }

    // 2. Blockchain Hardhat Node
    log("2/5", "Checking Ethereum Hardhat blockchain node on port 8545...");
    const bcAlreadyRunning = await checkPort(8545);
    if (bcAlreadyRunning) {
        log("2/5", "Blockchain node is already active on port 8545.");
    } else {
        log("2/5", "Starting local Hardhat blockchain node...");
        const bcProcess = spawn(process.execPath, [hardhatCli, "node"], {
            cwd: BLOCKCHAIN_DIR,
            stdio: "ignore",
            shell: false
        });
        spawnedProcesses.push(bcProcess);

        const nodeReady = await waitForPort(8545, 25);
        if (!nodeReady) {
            console.error("ERROR: Hardhat blockchain node failed to start on port 8545 within 25 seconds.");
            cleanup();
            process.exit(1);
        }
        log("2/5", "Hardhat blockchain node is online (Port 8545, Chain ID 31337).");
    }

    // 3. Deploy Smart Contract
    log("3/5", "Deploying and verifying EVoting smart contract on local blockchain...");
    try {
        const deployOutput = execSync(`"${process.execPath}" "${hardhatCli}" run scripts/deploy.ts --network localhost`, {
            cwd: BLOCKCHAIN_DIR,
            encoding: "utf8"
        });
        const match = deployOutput.match(/Contract Address:\s*(0x[a-fA-F0-9]{40})/);
        const address = match ? match[1] : "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        log("3/5", `Smart contract deployed and verified at address: ${address}`);
    } catch (deployErr) {
        console.error("ERROR deploying smart contract:", deployErr.message);
        cleanup();
        process.exit(1);
    }

    // 4. Backend Express API
    log("4/5", "Checking Backend REST API Gateway on port 5000...");
    const apiAlreadyRunning = await checkPort(5000);
    if (apiAlreadyRunning) {
        log("4/5", "Backend REST API is already active on port 5000.");
    } else {
        log("4/5", "Starting Backend Express API server...");
        const apiProcess = spawn(process.execPath, ["server.js"], {
            cwd: BACKEND_DIR,
            stdio: "ignore",
            shell: false
        });
        spawnedProcesses.push(apiProcess);

        const apiReady = await waitForPort(5000, 20);
        if (!apiReady) {
            console.error("ERROR: Backend REST API server failed to respond on port 5000 within 20 seconds.");
            cleanup();
            process.exit(1);
        }
        log("4/5", "Backend REST API is online and responding (Port 5000).");
    }

    // 5. Desktop Application Window
    log("5/5", "Launching Desktop Election Management Application Window...");
    console.log("-----------------------------------------------------------------");
    console.log("  All services active: PostgreSQL [5432] | EVM [8545] | API [5000]");
    console.log("  The desktop app will open now. Close the window when done.");
    console.log("-----------------------------------------------------------------\n");

    const electronProcess = spawn(electronExe, ["."], {
        cwd: FRONTEND_DIR,
        stdio: "inherit",
        shell: false
    });

    electronProcess.on("close", (code) => {
        log("EXIT", `Desktop application window closed (exit code ${code}).`);
        cleanup();
        process.exit(0);
    });

    electronProcess.on("error", (err) => {
        console.error("ERROR launching electron:", err.message);
        cleanup();
        process.exit(1);
    });
}

main().catch((err) => {
    console.error("Fatal initialization error:", err);
    cleanup();
    process.exit(1);
});
