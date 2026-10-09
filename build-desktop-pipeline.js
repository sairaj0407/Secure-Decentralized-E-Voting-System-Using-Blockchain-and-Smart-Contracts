const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function runCmd(cmd, cwd) {
    try {
        console.log(`\nExecuting: ${cmd} (in ${cwd || "."})...`);
        execSync(cmd, { cwd, stdio: "inherit" });
        return true;
    } catch (err) {
        console.error(`Error executing ${cmd}:`, err.message);
        return false;
    }
}

function main() {
    console.log("==================================================");
    console.log("SDEMS MASTER DESKTOP INSTALLER BUILD PIPELINE");
    console.log("==================================================");

    const rootDir = __dirname;
    const frontendDir = path.join(rootDir, "frontend");

    // 1. Build React frontend using Vite
    console.log("\n--- [Step 1] Building React Frontend Assets ---");
    const buildSuccess = runCmd("npm run build", frontendDir);
    if (!buildSuccess) {
        console.error("Vite frontend build failed. Terminating pipeline.");
        process.exit(1);
    }

    // 2. Package Electron desktop app and build NSIS installer
    console.log("\n--- [Step 2] Compiling NSIS Windows Installer ---");
    const packageSuccess = runCmd("node build-desktop.cjs", frontendDir);
    if (!packageSuccess) {
        console.error("Electron desktop packaging failed. Terminating pipeline.");
        process.exit(1);
    }

    // 3. Verify final packaged installer path
    const distDesktopDir = path.join(frontendDir, "dist-desktop");
    const installerFile = fs.readdirSync(distDesktopDir).find(f => f.startsWith("SDEMS") && f.endsWith(".exe"));
    const installerPath = installerFile ? path.join(distDesktopDir, installerFile) : null;
    
    if (!installerPath || !fs.existsSync(installerPath)) {
        console.error(`Error: Packaging completed but installer not found in:\n${distDesktopDir}`);
        process.exit(1);
    }
    console.log(`\n[PASS] Installer successfully built at: ${installerPath}`);

    // 4. Run automated desktop integration verification checks
    console.log("\n--- [Step 3] Running Automated Integration Verification Checkers ---");
    const verifySuccess = runCmd("node verify-desktop.js", rootDir);
    if (!verifySuccess) {
        console.error("Desktop integration verification checker failed.");
        process.exit(1);
    }

    console.log("\n==================================================");
    console.log("SDEMS MASTER DESKTOP PACKAGING COMPLETED SUCCESSFULLY!");
    console.log(`Installer Path: ${installerPath}`);
    console.log("==================================================");
}

main();
