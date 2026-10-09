const {
    votingContract,
} = require("../config/blockchain");

const nonces = {};

// Helper to fetch uncached live nonce directly from JSON-RPC to prevent desynchronization
const getFreshNonceOverrides = async (contract, walletInstance = null) => {
    const runner = walletInstance || contract.runner;
    if (runner && runner.provider) {
        const address = runner.address || (typeof runner.getAddress === "function" ? await runner.getAddress() : null);
        if (address) {
            try {
                const hexNonce = await runner.provider.send("eth_getTransactionCount", [address, "latest"]);
                const nonce = parseInt(hexNonce, 16);
                console.log(`[getFreshNonceOverrides] Wallet: ${address}, Nonce: ${nonce}`);
                return { nonce };
            } catch (err) {
                const fallbackNonce = await runner.provider.getTransactionCount(address, "latest");
                console.log(`[getFreshNonceOverrides Fallback] Wallet: ${address}, Nonce: ${fallbackNonce}`);
                return { nonce: fallbackNonce };
            }
        }
    }
    return {};
};

const resetTrackedNonce = () => {};

const handleTxError = () => {};


// ============================================================
// CREATE ELECTION
// ============================================================

const createElectionOnBlockchain = async (
    title,
    description,
    startTime,
    endTime
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx = await votingContract.createElection(
            title,
            description,
            startTime,
            endTime,
            overrides
        );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};


// ============================================================
// REGISTER CANDIDATE
// ============================================================

const registerCandidateOnBlockchain = async (
    electionId,
    name,
    party,
    symbol,
    manifesto
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx =
            await votingContract.registerCandidate(
                electionId,
                name,
                party,
                symbol,
                manifesto,
                overrides
            );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};


// ============================================================
// AUTHORIZE VOTER
// ============================================================

const authorizeVoterOnBlockchain = async (
    electionId,
    walletAddress
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx =
            await votingContract.authorizeVoter(
                electionId,
                walletAddress,
                overrides
            );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};


// ============================================================
// START ELECTION
// ============================================================

const startElectionOnBlockchain = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx =
            await votingContract.startElection(
                electionId,
                overrides
            );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};


// ============================================================
// CAST VOTE
// ============================================================

const castVoteOnBlockchain = async (
    electionId,
    candidateId,
    wallet
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const contractWithWallet =
            votingContract.connect(wallet);

        const overrides = await getFreshNonceOverrides(votingContract, wallet);
        const tx =
            await contractWithWallet.castVote(
                electionId,
                candidateId,
                overrides
            );

        const receipt = await tx.wait();

        const address = wallet?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract, wallet);
        throw err;
    }
};


// ============================================================
// CAST VOTE FOR (OFFICIAL RELAYER FOR VERIFIED ELECTORS)
// ============================================================

const castVoteForOnBlockchain = async (
    electionId,
    candidateId,
    voterAddress
) => {
    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx = await votingContract.castVoteFor(
            electionId,
            candidateId,
            voterAddress,
            overrides
        );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};

const isVoterAuthorizedOnBlockchain = async (electionId, voterAddress) => {
    if (!votingContract) return false;
    try {
        return await votingContract.isVoterAuthorized(electionId, voterAddress);
    } catch {
        return false;
    }
};

const hasVoterVotedOnBlockchain = async (electionId, voterAddress) => {
    if (!votingContract) return false;
    try {
        return await votingContract.hasVoterVoted(electionId, voterAddress);
    } catch {
        return false;
    }
};


// ============================================================
// END ELECTION
// ============================================================

const endElectionOnBlockchain = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx =
            await votingContract.endElection(
                electionId,
                overrides
            );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};


// ============================================================
// PUBLISH RESULTS
// ============================================================

const publishResultsOnBlockchain = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    try {
        const overrides = await getFreshNonceOverrides(votingContract);
        const tx =
            await votingContract.publishResults(
                electionId,
                overrides
            );

        const receipt = await tx.wait();

        const runner = votingContract.runner;
        const address = runner?.address;
        if (address && nonces[address] !== undefined) {
            nonces[address]++;
        }

        return {
            transactionHash: receipt.hash,
            receipt,
        };
    } catch (err) {
        handleTxError(votingContract);
        throw err;
    }
};


// ============================================================
// READ ELECTION
// ============================================================

const getBlockchainElection = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    const election =
        await votingContract.getElection(
            electionId
        );

    return election;
};


// ============================================================
// READ CANDIDATES
// ============================================================

const getBlockchainCandidates = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    const candidates =
        await votingContract.getCandidates(
            electionId
        );

    return candidates;
};


// ============================================================
// READ VOTE COUNT
// ============================================================

const getBlockchainVoteCount = async (
    electionId,
    candidateId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    return await votingContract.getVoteCount(
        electionId,
        candidateId
    );
};


// ============================================================
// GET BLOCKCHAIN ELECTION RESULTS
// ============================================================

const getBlockchainElectionResults = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    const candidates =
        await votingContract.getCandidates(
            electionId
        );

    const results = [];

    for (const candidate of candidates) {

        const voteCount =
            await votingContract.getVoteCount(
                electionId,
                candidate.id
            );

        results.push({

            id: candidate.id.toString(),

            name: candidate.name,

            party: candidate.party,

            symbol: candidate.symbol,

            manifesto: candidate.manifesto,

            votes: voteCount.toString()

        });
    }

    const totalVotes = results.reduce(
        (total, candidate) =>
            total + Number(candidate.votes),
        0
    );

    return {

        electionId: electionId.toString(),

        totalVotes,

        candidates: results

    };
};


// ============================================================
// GET WINNER
// ============================================================

const getBlockchainWinner = async (
    electionId
) => {

    if (!votingContract) {
        throw new Error(
            "Blockchain contract is not configured."
        );
    }

    return await votingContract.getWinner(
        electionId
    );
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    createElectionOnBlockchain,

    registerCandidateOnBlockchain,

    authorizeVoterOnBlockchain,

    startElectionOnBlockchain,

    castVoteOnBlockchain,

    castVoteForOnBlockchain,

    isVoterAuthorizedOnBlockchain,

    hasVoterVotedOnBlockchain,

    endElectionOnBlockchain,

    publishResultsOnBlockchain,

    getBlockchainElection,

    getBlockchainCandidates,

    getBlockchainVoteCount,

    getBlockchainElectionResults,

    getBlockchainWinner,

};