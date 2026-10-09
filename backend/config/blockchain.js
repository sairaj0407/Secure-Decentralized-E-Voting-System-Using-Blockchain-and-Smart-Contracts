const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { ethers } = require("ethers");
const EVotingArtifact = require("../blockchain/EVoting.json");
const fs = require("fs");

const RPC_URL =
    process.env.BLOCKCHAIN_RPC_URL ||
    "http://127.0.0.1:8545";

let CONTRACT_ADDRESS =
    process.env.EVOTING_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Resolve dynamic deployment address from APPDATA if available
const appDataDir = path.join(
    process.env.APPDATA || (process.platform === "darwin" ? path.join(process.env.HOME, "Library/Application Support") : path.join(process.env.HOME, ".config")),
    "SDEMS"
);
const deploymentPath = path.join(appDataDir, "deployment.json");
if (fs.existsSync(deploymentPath)) {
    try {
        const deployData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
        if (deployData && deployData.contractAddress) {
            CONTRACT_ADDRESS = deployData.contractAddress;
            console.log(`[Blockchain Config] Loaded dynamic contract address: ${CONTRACT_ADDRESS}`);
        }
    } catch (err) {
        console.error("[Blockchain Config] Error parsing deployment.json:", err.message);
    }
}

const ADMIN_PRIVATE_KEY =
    process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY;

const provider =
    new ethers.JsonRpcProvider(RPC_URL);

let adminWallet = null;
let votingContract = null;

if (!ADMIN_PRIVATE_KEY) {

    console.error(
        "BLOCKCHAIN_ADMIN_PRIVATE_KEY is missing from .env"
    );

} else {

    adminWallet =
        new ethers.Wallet(
            ADMIN_PRIVATE_KEY,
            provider
        );

    votingContract =
        new ethers.Contract(
            CONTRACT_ADDRESS,
            EVotingArtifact.abi,
            adminWallet
        );

    console.log(
        "Blockchain contract connected."
    );

    console.log(
        "Admin wallet:",
        adminWallet.address
    );

    console.log(
        "Contract:",
        CONTRACT_ADDRESS
    );
}

module.exports = {
    provider,
    adminWallet,
    votingContract,
    CONTRACT_ADDRESS,
};