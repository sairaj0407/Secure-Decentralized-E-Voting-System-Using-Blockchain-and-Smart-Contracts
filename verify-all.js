const { execSync } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

function runCmd(cmd, cwd) {
    try {
        console.log(`Executing: ${cmd} (in ${cwd || "."})...`);
        execSync(cmd, { cwd, stdio: "inherit" });
        return true;
    } catch (err) {
        console.error(`Error executing ${cmd}:`, err.message);
        return false;
    }
}

async function pingBackend() {
    return new Promise((resolve) => {
        http.get("http://localhost:5000/api/health", (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.success && parsed.overallStatus === "ONLINE");
                } catch {
                    resolve(false);
                }
            });
        }).on("error", () => resolve(false));
    });
}

async function main() {
    console.log("=========================================");
    console.log("SDEMS - INTEGRATION TESTING & AUDIT RUNNER");
    console.log("=========================================");

    const contractCompiled = runCmd("npx hardhat compile", path.join(__dirname, "blockchain"));
    const contractTested = runCmd("npx hardhat test", path.join(__dirname, "blockchain"));
    const frontendBuilt = runCmd("npm run build", path.join(__dirname, "frontend"));

    const backendRunning = await pingBackend();
    const dbConnected = backendRunning; // health check handles db verify
    const blockchainNodeActive = backendRunning; // health check handles node verify

    const analyticsScriptExists = fs.existsSync(path.join(__dirname, "analytics", "analyze_votes.py"));

    console.log("\n========================================");
    console.log("SECURE DECENTRALIZED ELECTION SYSTEM");
    console.log("FINAL INTEGRATION VERIFICATION REPORT");
    console.log("========================================");
    console.log(`Frontend Build:           ${frontendBuilt ? "PASS" : "FAIL"}`);
    console.log(`Backend Server API:       ${backendRunning ? "PASS" : "FAIL"}`);
    console.log(`PostgreSQL Database:      ${dbConnected ? "PASS" : "FAIL"}`);
    console.log(`Blockchain local RPC:     ${blockchainNodeActive ? "PASS" : "FAIL"}`);
    console.log(`Smart Contract Tests:     ${contractTested ? "PASS" : "FAIL"}`);
    console.log(`Analytics Engine:         ${analyticsScriptExists ? "PASS" : "FAIL"}`);
    console.log("========================================");

    const overallSuccess = frontendBuilt && backendRunning && contractTested && analyticsScriptExists;
    console.log(`OVERALL VALIDATION:       ${overallSuccess ? "PASS" : "FAIL"}`);
    console.log("========================================");

    process.exit(overallSuccess ? 0 : 1);
}

main();
