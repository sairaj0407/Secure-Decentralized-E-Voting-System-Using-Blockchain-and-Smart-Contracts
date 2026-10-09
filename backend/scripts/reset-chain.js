require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { ethers } = require("ethers");
const EVotingArtifact = require("../blockchain/EVoting.json");

(async () => {
    try {
        console.log("Connecting to provider...");
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
        
        console.log("Resetting Hardhat network state via hardhat_reset...");
        await provider.send("hardhat_reset", []);
        
        const adminWallet = new ethers.Wallet(process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY, provider);
        console.log("Admin wallet address:", adminWallet.address);

        console.log("Deploying EVoting contract to the reset chain...");
        const factory = new ethers.ContractFactory(EVotingArtifact.abi, EVotingArtifact.bytecode, adminWallet);
        const contract = await factory.deploy();
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log("Contract deployed successfully to:", contractAddress);
        
        if (contractAddress.toLowerCase() !== (process.env.EVOTING_CONTRACT_ADDRESS || "").toLowerCase()) {
            console.warn(`WARNING: Deployed contract address (${contractAddress}) differs from .env (${process.env.EVOTING_CONTRACT_ADDRESS})`);
        } else {
            console.log("SUCCESS: Deployed address matches .env address!");
        }

    } catch (e) {
        console.error("Reset failed:", e);
    } finally {
        process.exit();
    }
})();
