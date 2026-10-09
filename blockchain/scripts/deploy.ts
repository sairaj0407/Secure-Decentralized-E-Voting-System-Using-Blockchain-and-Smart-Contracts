import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const { ethers } = await network.connect();

    console.log("Deploying EVoting smart contract...");

    const [deployer] = await ethers.getSigners();

    console.log("Deployer address:", deployer.address);

    const balance = await ethers.provider.getBalance(
        deployer.address
    );

    console.log(
        "Deployer balance:",
        ethers.formatEther(balance),
        "ETH"
    );

    const EVoting =
        await ethers.getContractFactory("EVoting");

    const voting =
        await EVoting.deploy();

    await voting.waitForDeployment();

    const contractAddress =
        await voting.getAddress();

    console.log("");
    console.log("====================================");
    console.log("EVoting Contract Deployed");
    console.log("====================================");
    console.log("Contract Address:", contractAddress);
    console.log("Admin Address:", await voting.admin());
    console.log("====================================");

    // Save deployment.json dynamically to APPDATA for main/backend consumption
    const appDataDir = path.join(
        process.env.APPDATA || (process.platform === "darwin" ? path.join(process.env.HOME, "Library/Application Support") : path.join(process.env.HOME, ".config")),
        "SDEMS"
    );
    if (!fs.existsSync(appDataDir)) {
        fs.mkdirSync(appDataDir, { recursive: true });
    }
    const deploymentPath = path.join(appDataDir, "deployment.json");
    
    fs.writeFileSync(deploymentPath, JSON.stringify({
        network: "localhost",
        chainId: 31337,
        contractName: "EVoting",
        contractAddress: contractAddress,
        deployedAt: new Date().toISOString(),
        deploymentBlock: (await ethers.provider.getBlockNumber()).toString()
    }, null, 2), "utf8");
    console.log("[Deployer] Saved dynamic deployment info to:", deploymentPath);

    // Sync EVoting.json artifact to backend/blockchain/EVoting.json
    const sourceArtifact = path.join(process.cwd(), "artifacts", "contracts", "EVoting.sol", "EVoting.json");
    const destArtifactDir = path.join(process.cwd(), "..", "backend", "blockchain");
    const destArtifact = path.join(destArtifactDir, "EVoting.json");
    
    if (fs.existsSync(sourceArtifact)) {
        if (!fs.existsSync(destArtifactDir)) {
            fs.mkdirSync(destArtifactDir, { recursive: true });
        }
        fs.copyFileSync(sourceArtifact, destArtifact);
        console.log("[Deployer] Synchronized EVoting.json artifact to backend:", destArtifact);
    }

    // Automatically synchronize address to backend/.env
    const backendEnvPath = path.join(process.cwd(), "..", "backend", ".env");
    if (fs.existsSync(backendEnvPath)) {
        let envContent = fs.readFileSync(backendEnvPath, "utf8");
        if (envContent.includes("EVOTING_CONTRACT_ADDRESS=")) {
            envContent = envContent.replace(/EVOTING_CONTRACT_ADDRESS=[^\r\n]*/g, `EVOTING_CONTRACT_ADDRESS=${contractAddress}`);
        } else {
            envContent += `\nEVOTING_CONTRACT_ADDRESS=${contractAddress}\n`;
        }
        fs.writeFileSync(backendEnvPath, envContent, "utf8");
        console.log("[Deployer] Updated backend/.env EVOTING_CONTRACT_ADDRESS:", contractAddress);
    }

    // Automatically synchronize address to frontend/src/contractAddress.json
    const frontendConfigPath = path.join(process.cwd(), "..", "frontend", "src", "contractAddress.json");
    const frontendConfigDir = path.dirname(frontendConfigPath);
    if (!fs.existsSync(frontendConfigDir)) {
        fs.mkdirSync(frontendConfigDir, { recursive: true });
    }
    fs.writeFileSync(frontendConfigPath, JSON.stringify({
        contractAddress: contractAddress,
        network: "localhost",
        deployedAt: new Date().toISOString()
    }, null, 2), "utf8");
    console.log("[Deployer] Synchronized contract address to frontend config:", frontendConfigPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});