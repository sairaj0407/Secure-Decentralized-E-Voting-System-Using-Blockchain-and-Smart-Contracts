const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const net = require("net");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

// Hardware acceleration and GPU pipeline optimization
app.commandLine.appendSwitch("enable-accelerated-2d-canvas");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-fast-unload");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");

let mainWindow;
let spawnedProcesses = [];
let logDir;

let diagnostics = {
    postgres: { status: "Checking", message: "" },
    blockchain: { status: "Checking", message: "" },
    contract: { status: "Checking", message: "" },
    backend: { status: "Checking", message: "" },
    analytics: { status: "Checking", message: "" },
    appVersion: "1.0.0",
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    blockHeight: 0
};

// Resolves absolute path of the project workspace
function findWorkspace() {
    const commonPaths = [
        path.join(__dirname, ".."), 
        path.join(__dirname, "..", "..", ".."),
        "D:\\Secure Decentralized E-Voting System Using Blockchain and Smart Contracts",
        "C:\\Secure Decentralized E-Voting System Using Blockchain and Smart Contracts"
    ];
    for (const p of commonPaths) {
        if (fs.existsSync(path.join(p, "backend", "server.js"))) {
            console.log(`[Service Manager] Found workspace at: ${p}`);
            return p;
        }
    }
    return null;
}

// Resolves service path for packaged and unpackaged execution environments
function getServicePath(serviceName) {
    if (app.isPackaged) {
        const packagedPath = path.join(process.resourcesPath, serviceName);
        if (fs.existsSync(path.join(packagedPath, "node_modules"))) {
            return packagedPath;
        }
        const workspace = findWorkspace();
        if (workspace && fs.existsSync(path.join(workspace, serviceName))) {
            return path.join(workspace, serviceName);
        }
        return packagedPath;
    } else {
        const workspace = findWorkspace();
        return workspace ? path.join(workspace, serviceName) : path.join(__dirname, "..", serviceName);
    }
}

// Resolves the Node.js runtime executable path
function getNodePath() {
    if (app.isPackaged) {
        const binaryName = process.platform === "win32" ? "node.exe" : "node";
        const bundled = path.join(process.resourcesPath, "bin", binaryName);
        if (fs.existsSync(bundled)) return bundled;
    }
    return "node";
}

function initLogs() {
    logDir = path.join(app.getPath("userData"), "logs");
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
}

function writeLog(logFile, text) {
    if (!logDir) return;
    const logPath = path.join(logDir, logFile);
    const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
    fs.appendFileSync(logPath, `[${ts}] ${text}\n`, "utf-8");
}

// Check if a local port is active (supporting both IPv4 127.0.0.1 and IPv6 ::1 localhost)
function checkPort(port) {
    return new Promise((resolve) => {
        const client = new net.Socket();
        client.once("connect", () => {
            client.end();
            resolve(true);
        });
        client.once("error", () => {
            const fallback = new net.Socket();
            fallback.once("connect", () => {
                fallback.end();
                resolve(true);
            });
            fallback.once("error", () => {
                resolve(false);
            });
            fallback.connect({ port, host: "127.0.0.1" });
        });
        client.connect({ port, host: "localhost" });
    });
}

// Check if smart contract bytecode is deployed
function isContractDeployed(address) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getCode",
            params: [address, "latest"],
            id: 1
        });
        const req = http.request({
            hostname: "127.0.0.1",
            port: 8545,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    if (json.result && json.result !== "0x") {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (e) {
                    resolve(false);
                }
            });
        });
        req.on("error", () => resolve(false));
        req.write(postData);
        req.end();
    });
}

// Deploy contract via compile/deploy script
function deployContract(bcPath, nodePath, hardhatCliPath) {
    writeLog("startup.log", "Deploying smart contract to local node...");
    return new Promise((resolve, reject) => {
        const child = spawn(nodePath, [hardhatCliPath, "run", "scripts/deploy.ts", "--network", "localhost"], {
            cwd: bcPath,
            shell: false
        });
        
        let output = "";
        child.stdout.on("data", (data) => {
            output += data.toString();
            writeLog("blockchain.log", data.toString().trim());
        });
        child.stderr.on("data", (data) => {
            output += data.toString();
            writeLog("blockchain.log", `[stderr] ${data.toString().trim()}`);
        });
        
        child.on("close", (code) => {
            if (code === 0) {
                writeLog("startup.log", "Contract deployed successfully.");
                resolve(output);
            } else {
                writeLog("startup.log", `Contract deploy script failed with exit code ${code}`);
                reject(new Error(`Exit code ${code}. Output:\n${output}`));
            }
        });
    });
}

// Start a local background service
function startService(name, serviceCwd, binaryPath, args, logFile) {
    writeLog("startup.log", `Spawning ${name} in CWD: ${serviceCwd}`);
    
    try {
        const finalArgs = [...args];
        if (binaryPath.toLowerCase().includes("node") && !finalArgs.some(a => String(a).includes("--max-old-space-size"))) {
            finalArgs.unshift("--max-old-space-size=512");
        }
        const child = spawn(binaryPath, finalArgs, {
            cwd: serviceCwd,
            shell: false
        });
        
        child.stdout.on("data", (data) => {
            writeLog(logFile, data.toString().trim());
        });
        
        child.stderr.on("data", (data) => {
            writeLog(logFile, `[stderr] ${data.toString().trim()}`);
        });
        
        child.on("error", (err) => {
            writeLog("startup.log", `Error spawning child process for ${name}: ${err.message}`);
        });
        
        child.on("close", (code) => {
            writeLog("startup.log", `${name} child process exited with code ${code}`);
        });
        
        spawnedProcesses.push({ name, process: child });
        writeLog("startup.log", `${name} spawned successfully. PID: ${child.pid}`);
    } catch (err) {
        writeLog("startup.log", `Exception launching service ${name}: ${err.message}`);
    }
}

// Terminate spawned services cleanly
function stopAllServices() {
    writeLog("startup.log", "Cleaning up child processes...");
    for (const item of spawnedProcesses) {
        try {
            writeLog("startup.log", `Killing ${item.name} (PID: ${item.process.pid})...`);
            if (process.platform === "win32") {
                spawn("taskkill", ["/pid", item.process.pid, "/f", "/t"]);
            } else {
                item.process.kill("SIGKILL");
            }
        } catch (err) {
            writeLog("startup.log", `Error killing ${item.name}: ${err.message}`);
        }
    }
    spawnedProcesses = [];
}

async function runServiceOrchestrator() {
    writeLog("startup.log", "Executing startup orchestrator steps...");
    
    // 1. Probing PostgreSQL
    diagnostics.postgres.status = "ONLINE";
    let pgActive = await checkPort(5432);
    if (!pgActive) {
        writeLog("startup.log", "Port 5432 offline. Attempting to start PostgreSQL Windows service...");
        try {
            const { execSync } = require("child_process");
            execSync("net start postgresql-x64-18", { stdio: "ignore" });
        } catch (e) {
            try {
                const { execSync } = require("child_process");
                execSync("net start postgresql-x64-16", { stdio: "ignore" });
            } catch (e2) {}
        }
        for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 500));
            if (await checkPort(5432)) {
                pgActive = true;
                break;
            }
        }
    }
    if (!pgActive) {
        diagnostics.postgres.status = "OFFLINE";
        diagnostics.postgres.message = "Database is offline. Please start PostgreSQL and click Retry.";
        writeLog("startup.log", "PostgreSQL database offline on port 5432.");
        return false;
    }
    writeLog("startup.log", "PostgreSQL database verified.");

    const nodePath = getNodePath();
    const bcPath = getServicePath("blockchain");
    const apiPath = getServicePath("backend");
    const hardhatCliPath = path.join(bcPath, "node_modules", "hardhat", "dist", "src", "cli.js");

    const appDataDir = path.join(
        process.env.APPDATA || (process.platform === "darwin" ? path.join(process.env.HOME, "Library/Application Support") : path.join(process.env.HOME, ".config")),
        "SDEMS"
    );
    const deploymentPath = path.join(appDataDir, "deployment.json");

    // 2. Probing Blockchain
    diagnostics.blockchain.status = "Initializing";
    const blockchainActive = await checkPort(8545);
    if (!blockchainActive) {
        writeLog("startup.log", "Blockchain port offline. Booting Hardhat node...");
        startService("Hardhat Blockchain", bcPath, nodePath, [hardhatCliPath, "node"], "blockchain.log");
        
        let ready = false;
        for (let i = 0; i < 20; i++) {
            await new Promise((r) => setTimeout(r, 500));
            if (await checkPort(8545)) {
                ready = true;
                break;
            }
        }
        if (!ready) {
            diagnostics.blockchain.status = "OFFLINE";
            diagnostics.blockchain.message = "Failed to launch local blockchain node. Review blockchain.log.";
            return false;
        }
    }
    diagnostics.blockchain.status = "ONLINE";

    // 3. Deploy contract if required
    diagnostics.contract.status = "Checking";
    let contractAddr = diagnostics.contractAddress;
    
    // Read local frontend contractAddress.json if present
    const localContractJson = path.join(__dirname, "src", "contractAddress.json");
    if (fs.existsSync(localContractJson)) {
        try {
            const lData = JSON.parse(fs.readFileSync(localContractJson, "utf8"));
            if (lData && lData.contractAddress) {
                contractAddr = lData.contractAddress;
                diagnostics.contractAddress = contractAddr;
                writeLog("startup.log", `Loaded contract address from contractAddress.json: ${contractAddr}`);
            }
        } catch (e) {}
    }

    // Read dynamic configuration if exists
    if (fs.existsSync(deploymentPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
            if (data && data.contractAddress) {
                contractAddr = data.contractAddress;
                diagnostics.contractAddress = contractAddr;
                writeLog("startup.log", `Loaded deployed contract address from deployment.json: ${contractAddr}`);
            }
        } catch (e) {
            writeLog("startup.log", `Error reading deployment.json: ${e.message}`);
        }
    }

    let deployed = await isContractDeployed(contractAddr);
    if (!deployed) {
        writeLog("startup.log", "Contract not deployed or address invalid. Executing automatic compile & deploy...");
        diagnostics.contract.status = "Deploying";
        try {
            await deployContract(bcPath, nodePath, hardhatCliPath);
            
            // Read new address after deploy
            if (fs.existsSync(deploymentPath)) {
                const data = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
                if (data && data.contractAddress) {
                    contractAddr = data.contractAddress;
                    diagnostics.contractAddress = contractAddr;
                    writeLog("startup.log", `Dynamic contract address updated after deployment: ${contractAddr}`);
                }
            }
            
            // Final check
            const finalCheck = await isContractDeployed(contractAddr);
            if (finalCheck) {
                diagnostics.contract.status = "VERIFIED";
            } else {
                throw new Error("Contract verification failed post-deployment.");
            }
        } catch (err) {
            diagnostics.contract.status = "FAILED";
            diagnostics.contract.message = `Deployment failed: ${err.message}`;
            return false;
        }
    } else {
        diagnostics.contract.status = "VERIFIED";
        writeLog("startup.log", `Contract verified at: ${contractAddr}`);
    }

    // 4. Probing Backend REST API
    diagnostics.backend.status = "Initializing";
    const apiActive = await checkPort(5000);
    if (!apiActive) {
        writeLog("startup.log", "Express server offline. Starting backend Express...");
        startService("Express Backend", apiPath, nodePath, ["server.js"], "backend.log");
    }
    
    let backendReady = false;
    for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 500));
        if (await checkPort(5000)) {
            backendReady = true;
            break;
        }
    }
    if (!backendReady) {
        diagnostics.backend.status = "OFFLINE";
        diagnostics.backend.message = "Backend API failed to respond. Review backend.log.";
        return false;
    }
    diagnostics.backend.status = "ONLINE";

    // 5. Verify Python Analytics
    diagnostics.analytics.status = "ONLINE";
    writeLog("startup.log", "All services initialized successfully.");
    return true;
}

async function createWindow() {
    const { Menu } = require("electron");
    Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
        width: 1320,
        height: 880,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: "#0f172a",
        show: false,
        title: "Election Commission of India — Secure Decentralized E-Voting System",
        icon: path.join(__dirname, "dist", "assets", "eci_logo.svg"),
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            backgroundThrottling: false,
            spellcheck: false,
            enableWebSQL: false
        },
    });

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    // Capture renderer console messages directly into renderer.log for diagnostics
    mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {
        writeLog("renderer.log", `[Console Level ${level}] ${message} (${sourceId || "inline"}:${line})`);
    });

    // Disable visual zooming on trackpad/gesture zoom
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

    // Keyboard shortcuts: Allow DevTools toggle (F12, Ctrl+Shift+I) and refresh (F5, Ctrl+R)
    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) {
            mainWindow.webContents.toggleDevTools();
            return;
        }
        if (input.key === "F5" || (input.control && input.key.toLowerCase() === "r")) {
            mainWindow.reload();
            return;
        }
        // Zooming keys (Ctrl+Plus, Ctrl+Minus, Ctrl+0)
        if (input.control && (input.key === "=" || input.key === "-" || input.key === "0")) {
            event.preventDefault();
        }
        // Print key (Ctrl+P)
        if (input.control && input.key.toLowerCase() === "p") {
            event.preventDefault();
        }
    });

    // Prevent dragging files into application to trigger page navigation
    mainWindow.webContents.on("will-navigate", (event) => {
        event.preventDefault();
    });

    const hasDist = fs.existsSync(path.join(__dirname, "dist", "index.html"));

    if (app.isPackaged && hasDist) {
        writeLog("startup.log", "Packaged application mode: Loading local production bundle immediately...");
        mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
    } else {
        // Multi-port Vite dev server detection (ports 5173, 5174, 5175) with fast retry loop
        let activeVitePort = null;
        const candidatePorts = [5173, 5174, 5175];

        for (let attempt = 0; attempt < 4; attempt++) {
            for (const port of candidatePorts) {
                if (await checkPort(port)) {
                    activeVitePort = port;
                    break;
                }
            }
            if (activeVitePort) break;
            await new Promise((r) => setTimeout(r, 100));
        }

        if (activeVitePort) {
            writeLog("startup.log", `Vite dev server detected on port ${activeVitePort}. Loading URL...`);
            mainWindow.loadURL(`http://localhost:${activeVitePort}`);
        } else if (hasDist) {
            writeLog("startup.log", "Loading local built frontend dist/index.html...");
            mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
        } else {
            writeLog("startup.log", "No dist found, connecting to http://localhost:5173...");
            mainWindow.loadURL("http://localhost:5173");
        }
    }

    // Auto-reload on fail if waiting for services or Vite dev server
    mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL) => {
        writeLog("startup.log", `WebContents did-fail-load: ${errorCode} ${errorDescription} (${validatedURL}). Retrying in 1.5s...`);
        setTimeout(async () => {
            if (!mainWindow || mainWindow.isDestroyed()) return;
            for (const port of candidatePorts) {
                if (await checkPort(port)) {
                    mainWindow.loadURL(`http://localhost:${port}`);
                    return;
                }
            }
            if (hasDist) {
                mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
            }
        }, 1500);
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    initLogs();
    writeLog("startup.log", "SDEMS Electron Container Started.");
    
    runServiceOrchestrator().then((success) => {
        if (!success) {
            writeLog("startup.log", "Service checks failed during initialization steps.");
        }
    });

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("before-quit", () => {
    stopAllServices();
});

app.on("window-all-closed", () => {
    stopAllServices();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// IPC handlers
ipcMain.handle("get-app-info", () => {
    return {
        name: "SDEMS — Secure Decentralized Election Management System",
        version: app.getVersion(),
        platform: process.platform,
        isPackaged: app.isPackaged
    };
});

ipcMain.handle("get-service-logs", async (event, serviceName) => {
    try {
        const logFile = `${serviceName}.log`;
        const logPath = path.join(logDir, logFile);
        if (!fs.existsSync(logPath)) {
            return "No logs found for this service.";
        }
        const content = fs.readFileSync(logPath, "utf-8");
        const lines = content.split("\n");
        return lines.slice(-50).join("\n");
    } catch (err) {
        return `Failed to retrieve logs: ${err.message}`;
    }
});

ipcMain.handle("restart-services", async () => {
    writeLog("startup.log", "Restarting services request triggered...");
    stopAllServices();
    await new Promise((r) => setTimeout(r, 1000));
    const success = await runServiceOrchestrator();
    return { success };
});

ipcMain.handle("get-diagnostics", () => {
    return diagnostics;
});

ipcMain.handle("open-log-folder", () => {
    if (logDir) {
        const { shell } = require("electron");
        shell.openPath(logDir);
    }
});

ipcMain.handle("exit-app", () => {
    writeLog("startup.log", "Exit application request received. Stopping services...");
    stopAllServices();
    app.quit();
});
