const fs = require("fs");
const path = require("path");
const builder = require("electron-builder");

// Backup original promises.rename
const originalRename = fs.promises.rename;

// Backup original fs.rename
const originalFsRename = fs.rename;

// Monkey-patch fs.promises.rename with retry logic, destination cleanup, and copy-and-delete fallback
fs.promises.rename = async function (oldPath, newPath) {
    let attempts = 0;
    const maxAttempts = 5;
    while (attempts < maxAttempts) {
        try {
            if (fs.existsSync(newPath)) {
                try {
                    fs.rmSync(newPath, { recursive: true, force: true });
                } catch (rmErr) {}
            }
            return await originalRename.call(fs.promises, oldPath, newPath);
        } catch (error) {
            attempts++;
            if (error.code === "EPERM" && attempts < maxAttempts) {
                console.warn(`[Rename Hook] EPERM encountered renaming ${oldPath} -> ${newPath}. Retrying in 1s... (Attempt ${attempts}/${maxAttempts})`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
                console.warn(`[Rename Hook] Rename failed with EPERM. Attempting copy-and-delete fallback from ${oldPath} to ${newPath}...`);
                try {
                    if (fs.existsSync(newPath)) {
                        fs.rmSync(newPath, { recursive: true, force: true });
                    }
                    fs.cpSync(oldPath, newPath, { recursive: true });
                    try {
                        fs.rmSync(oldPath, { recursive: true, force: true });
                    } catch (rmErr) {
                        console.warn(`[Rename Hook] Non-critical: Could not clean up temporary path ${oldPath} (${rmErr.message})`);
                    }
                    console.log(`[Rename Hook] Copy-and-delete fallback succeeded!`);
                    return;
                } catch (fallbackError) {
                    console.error(`[Rename Hook] Copy-and-delete fallback failed:`, fallbackError);
                    throw error;
                }
            }
        }
    }
};

// Monkey-patch fs.rename with retry logic, destination cleanup, and copy-and-delete fallback
fs.rename = function (oldPath, newPath, callback) {
    let attempts = 0;
    const maxAttempts = 5;
    
    function tryRename() {
        if (fs.existsSync(newPath)) {
            try {
                fs.rmSync(newPath, { recursive: true, force: true });
            } catch (rmErr) {}
        }
        originalFsRename(oldPath, newPath, (error) => {
            if (error && error.code === "EPERM") {
                if (attempts < maxAttempts) {
                    attempts++;
                    console.warn(`[Rename Callback Hook] EPERM renaming ${oldPath} -> ${newPath}. Retrying in 1s...`);
                    setTimeout(tryRename, 1000);
                } else {
                    console.warn(`[Rename Callback Hook] Rename failed with EPERM. Attempting copy-and-delete fallback...`);
                    try {
                        if (fs.existsSync(newPath)) {
                            fs.rmSync(newPath, { recursive: true, force: true });
                        }
                        fs.cpSync(oldPath, newPath, { recursive: true });
                        try {
                            fs.rmSync(oldPath, { recursive: true, force: true });
                        } catch (rmErr) {
                            console.warn(`[Rename Callback Hook] Non-critical: Could not clean up temporary path ${oldPath} (${rmErr.message})`);
                        }
                        console.log(`[Rename Callback Hook] Copy-and-delete fallback succeeded!`);
                        callback(null);
                    } catch (fallbackError) {
                        console.error(`[Rename Callback Hook] Copy-and-delete fallback failed:`, fallbackError);
                        callback(error);
                    }
                }
            } else {
                callback(error);
            }
        });
    }
    
    tryRename();
};

console.log("[Rename Hook] Patched fs.rename and fs.promises.rename successfully!");

// Copy system node runtime to bundle it
const nodeExePath = process.execPath;
const binDir = path.join(__dirname, "bin");
if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
}
const targetNodePath = path.join(binDir, process.platform === "win32" ? "node.exe" : "node");

let copied = false;
if (!fs.existsSync(targetNodePath)) {
    try {
        fs.copyFileSync(nodeExePath, targetNodePath);
        console.log(`[Packager] Successfully bundled Node runtime from ${nodeExePath} to ${targetNodePath}`);
        copied = true;
    } catch (err) {
        console.error("[Packager] Failed to bundle Node runtime:", err);
    }
} else {
    console.log(`[Packager] Node runtime already present at ${targetNodePath}. Skipping copy.`);
}

// Function to run builder
function runBuilder() {
    console.log("[Packager] Launching electron-builder configuration...");
    builder.build() // Loads configurations directly from package.json without programmatic overrides
    .then((result) => {
        console.log("====================================");
        console.log("Desktop Build Completed Successfully!");
        console.log("====================================");
        
        // Post-pack copy of node_modules to avoid electron-builder's automatic filters
        const resourcesDir = path.join(__dirname, "dist-desktop", "win-unpacked", "resources");
        
        console.log("[Packager] Performing post-pack copy of backend dependencies...");
        const destBackend = path.join(resourcesDir, "backend", "node_modules");
        const srcBackend = path.join(__dirname, "..", "backend", "node_modules");
        if (fs.existsSync(srcBackend)) {
            if (!fs.existsSync(destBackend)) {
                fs.mkdirSync(destBackend, { recursive: true });
            }
            fs.cpSync(srcBackend, destBackend, { recursive: true });
            console.log("[Packager] Backend node_modules copied successfully.");
        }

        console.log("[Packager] Performing post-pack copy of blockchain dependencies...");
        const destBlockchain = path.join(resourcesDir, "blockchain", "node_modules");
        const srcBlockchain = path.join(__dirname, "..", "blockchain", "node_modules");
        if (fs.existsSync(srcBlockchain)) {
            if (!fs.existsSync(destBlockchain)) {
                fs.mkdirSync(destBlockchain, { recursive: true });
            }
            fs.cpSync(srcBlockchain, destBlockchain, { recursive: true });
            console.log("[Packager] Blockchain node_modules copied successfully.");
        }
        
        console.log(result);
    })
    .catch((err) => {
        console.error("Desktop Build Failed:", err);
        process.exit(1);
    });
}

if (copied) {
    console.log("[Packager] Waiting 3 seconds for file system lock release...");
    setTimeout(runBuilder, 3000);
} else {
    runBuilder();
}
