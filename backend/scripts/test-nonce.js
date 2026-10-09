require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { provider, adminWallet } = require("../config/blockchain");

(async () => {
    try {
        const nonces = {};
        const getNonce = async (wallet) => {
            const address = wallet.address;
            const networkNonce = await wallet.provider.getTransactionCount(address, "latest");
            let nonce = networkNonce;
            if (nonces[address] !== undefined && nonces[address] >= networkNonce) {
                nonce = nonces[address] + 1;
            }
            nonces[address] = nonce;
            return nonce;
        };

        console.log("Admin wallet address:", adminWallet.address);
        const nonce1 = await getNonce(adminWallet);
        console.log("Nonce 1:", nonce1);
        
        console.log("Sending tx 1...");
        const tx1 = await adminWallet.sendTransaction({
            to: adminWallet.address,
            value: 0,
            nonce: nonce1
        });
        await tx1.wait();
        
        const nonce2 = await getNonce(adminWallet);
        console.log("Nonce 2:", nonce2);
        
        console.log("Sending tx 2...");
        const tx2 = await adminWallet.sendTransaction({
            to: adminWallet.address,
            value: 0,
            nonce: nonce2
        });
        await tx2.wait();
        
        const nonce3 = await getNonce(adminWallet);
        console.log("Nonce 3:", nonce3);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
