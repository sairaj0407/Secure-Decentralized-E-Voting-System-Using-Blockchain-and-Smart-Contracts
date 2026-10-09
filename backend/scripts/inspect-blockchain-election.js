require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { votingContract, provider } = require("../config/blockchain");

(async () => {
    try {
        const election = await votingContract.getElection(1);
        console.log("On-chain election:");
        console.log("- id:", election.id.toString());
        console.log("- startTime:", election.startTime.toString());
        console.log("- endTime:", election.endTime.toString());
        console.log("- status:", election.status.toString());
        
        const latestBlock = await provider.getBlock("latest");
        console.log("On-chain block timestamp:", latestBlock.timestamp);
        console.log("Current system timestamp (Unix):", Math.floor(Date.now() / 1000));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
