require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { votingContract, provider } = require("../config/blockchain");

(async () => {
    try {
        console.log("Checking contract configuration...");
        if (!votingContract) {
            console.error("Contract not configured!");
            process.exit(1);
        }
        const admin = await votingContract.admin();
        console.log("On-chain contract admin:", admin);

        const blockNum = await provider.getBlockNumber();
        console.log("Current block number:", blockNum);

        try {
            const election = await votingContract.getElection(1);
            console.log("On-chain Election #1 details:", {
                id: election.id.toString(),
                title: election.title,
                status: election.status.toString(),
                exists: election.exists
            });
            const candidates = await votingContract.getCandidates(1);
            console.log("On-chain Candidates for Election #1:");
            candidates.forEach((c) => {
                console.log(`- Candidate #${c.id}: ${c.name} (${c.party}) [Votes: ${c.voteCount.toString()}]`);
            });
            const voterWallet = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
            const isAuth = await votingContract.authorizedVoters(1, voterWallet);
            console.log(`Is voter wallet ${voterWallet} authorized?`, isAuth);
        } catch (e) {
            console.log("Election #1 query failed (maybe doesn't exist yet):", e.message);
        }
    } catch (err) {
        console.error("Error connecting to contract:", err);
    }
})();
