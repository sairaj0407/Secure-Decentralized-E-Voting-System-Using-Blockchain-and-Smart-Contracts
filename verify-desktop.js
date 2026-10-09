const fs = require("fs");
const path = require("path");
const net = require("net");
const http = require("http");

console.log("=========================================");
console.log("SDEMS - DESKTOP STANDALONE INTEGRATION TESTS");
console.log("=========================================");

const distDesktopDir = path.join(__dirname, "frontend", "dist-desktop");
const winUnpackedDir = path.join(distDesktopDir, "win-unpacked");
const resourcesDir = path.join(winUnpackedDir, "resources");

let allPassed = true;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
    } else {
        console.log(`[FAIL] ${message}`);
        allPassed = false;
    }
}

// 1. Packaged Output Folders & Resources Checks
console.log("\n--- Checking Packaged Build Structures ---");
assert(fs.existsSync(winUnpackedDir), "Packaged application output folder 'win-unpacked' exists.");
assert(fs.existsSync(resourcesDir), "Packaged resources directory exists.");
assert(fs.existsSync(path.join(resourcesDir, "backend")), "Packaged backend folder resource exists.");
assert(fs.existsSync(path.join(resourcesDir, "blockchain")), "Packaged blockchain folder resource exists.");
assert(fs.existsSync(path.join(resourcesDir, "analytics")), "Packaged analytics folder resource exists.");

// 2. Bundled Node Runtime Binary Check
console.log("\n--- Checking Bundled Node.js Runtime ---");
const nodeBinPath = path.join(resourcesDir, "bin", process.platform === "win32" ? "node.exe" : "node");
assert(fs.existsSync(nodeBinPath), `Bundled Node runtime executable exists at: ${nodeBinPath}`);

// Helper to probe active local port connections
function probePort(port) {
    return new Promise((resolve) => {
        const client = new net.Socket();
        client.once("connect", () => {
            client.end();
            resolve(true);
        });
        client.once("error", () => {
            resolve(false);
        });
        client.connect({ port, host: "127.0.0.1" });
    });
}

// 3. System Services Probing checks
async function runChecks() {
    console.log("\n--- Probing Background Integration Ports ---");
    
    const postgresOnline = await probePort(5432);
    assert(postgresOnline, "PostgreSQL Database Service is ONLINE on port 5432.");
    
    const blockchainOnline = await probePort(8545);
    assert(blockchainOnline, "Hardhat Blockchain Local Node is ONLINE on port 8545.");
    
    const backendOnline = await probePort(5000);
    assert(backendOnline, "Express Backend API server is ONLINE on port 5000.");
    
    if (backendOnline) {
        console.log("\n--- Checking Backend API Health Response ---");
        await new Promise((resolve) => {
            http.get("http://127.0.0.1:5000/api/health", (res) => {
                let data = "";
                res.on("data", (chunk) => data += chunk);
                res.on("end", () => {
                    try {
                        const json = JSON.parse(data);
                        assert(json.success, "Backend returns overall status success code.");
                        assert(json.services.database.status === "ONLINE", "Backend reports PostgreSQL status ONLINE.");
                        assert(json.services.blockchain.status === "ONLINE", "Backend reports Blockchain status ONLINE.");
                        assert(json.services.contract.status === "VERIFIED", "Backend reports Contract status VERIFIED.");
                        assert(json.services.analytics.status === "ONLINE", "Backend reports Analytics status ONLINE.");
                    } catch (e) {
                        assert(false, `Failed to parse health API response: ${e.message}`);
                    }
                    resolve();
                });
            }).on("error", (err) => {
                assert(false, `Backend health check failed: ${err.message}`);
                resolve();
            });
        });
    } else {
        console.log("\n[WARNING] Backend offline. Skipping API endpoints health checks.");
    }
    
    console.log("\n=========================================");
    if (allPassed) {
        console.log("DESKTOP INTEGRATION VERIFICATION: PASS");
    } else {
        console.log("DESKTOP INTEGRATION VERIFICATION: FAIL");
        process.exit(1);
    }
    console.log("=========================================");
}

runChecks();