const { execSync } = require("child_process");

const cliArgs = process.argv.slice(2).map((a) => parseInt(a, 10)).filter((n) => !isNaN(n));
const ports = cliArgs.length > 0 ? cliArgs : [5000, 8545, 5173, 5174, 5175];

console.log("==================================================");
console.log("[SDEMS Port Cleaner] Checking ports:", ports.join(", "));
console.log("==================================================");

for (const port of ports) {
    try {
        if (process.platform === "win32") {
            const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
            const lines = out.trim().split("\n");
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== "0" && parseInt(pid, 10) !== process.pid) {
                    try {
                        console.log(`[SDEMS Port Cleaner] Freeing port ${port} by terminating PID ${pid}...`);
                        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
                    } catch (kErr) {}
                }
            }
        } else {
            const out = execSync(`lsof -ti:${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
            const pids = out.trim().split("\n");
            for (const pid of pids) {
                if (pid && parseInt(pid, 10) !== process.pid) {
                    try {
                        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
                    } catch (kErr) {}
                }
            }
        }
    } catch (e) {
        // Port was already free
    }
}

console.log("[SDEMS Port Cleaner] Done.");
console.log("==================================================");
