import { expect } from "chai";
import { network } from "hardhat";

describe("EVoting Smart Contract", function () {

    let voting: any;

    let admin: any;
    let voter1: any;
    let voter2: any;
    let unauthorizedVoter: any;


    // ============================================================
    // SETUP
    // ============================================================

    beforeEach(async function () {

        const { ethers } = await network.connect();

        [
            admin,
            voter1,
            voter2,
            unauthorizedVoter
        ] = await ethers.getSigners();


        const EVoting =
            await ethers.getContractFactory("EVoting");

        voting =
            await EVoting.deploy();

        await voting.waitForDeployment();
    });


    // ============================================================
    // TEST 1 — ADMIN
    // ============================================================

    it("should set deployer as admin", async function () {

        expect(
            await voting.admin()
        ).to.equal(admin.address);

    });


    // ============================================================
    // TEST 2 — CREATE ELECTION
    // ============================================================

    it("should create an election", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);

        const startTime =
            currentTime + 60;

        const endTime =
            currentTime + 3600;


        await voting.createElection(
            "College Student Council Election 2026",
            "Annual student council election",
            startTime,
            endTime
        );


        const election =
            await voting.getElection(1);


        expect(election.title)
            .to.equal(
                "College Student Council Election 2026"
            );


        expect(election.exists)
            .to.equal(true);

    });


    // ============================================================
    // TEST 3 — REGISTER CANDIDATES
    // ============================================================

    it("should register candidates", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime + 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Student Party",
            "Star",
            "Better campus"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Progress Party",
            "Circle",
            "Better facilities"
        );


        const candidates =
            await voting.getCandidates(1);


        expect(candidates.length)
            .to.equal(2);


        expect(candidates[0].name)
            .to.equal("Alice");


        expect(candidates[1].name)
            .to.equal("Bob");

    });


    // ============================================================
    // TEST 4 — AUTHORIZE VOTER
    // ============================================================

    it("should authorize a voter", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime + 60,
            currentTime + 3600
        );


        await voting.authorizeVoter(
            1,
            voter1.address
        );


        expect(
            await voting.authorizedVoters(
                1,
                voter1.address
            )
        ).to.equal(true);

    });


    // ============================================================
    // TEST 5 — START ELECTION
    // ============================================================

    it("should start an election", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.startElection(1);


        const status =
            await voting.getElectionStatus(1);


        expect(status)
            .to.equal(2);

    });


    // ============================================================
    // TEST 6 — SUCCESSFUL VOTE
    // ============================================================

    it("should allow an authorized voter to vote", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.authorizeVoter(
            1,
            voter1.address
        );


        await voting.startElection(1);


        await voting
            .connect(voter1)
            .castVote(1, 1);


        expect(
            await voting.getVoteCount(1, 1)
        ).to.equal(1);


        expect(
            await voting.hasVoted(
                1,
                voter1.address
            )
        ).to.equal(true);

    });


    // ============================================================
    // TEST 7 — DOUBLE VOTING
    // ============================================================

    it("should reject a second vote", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.authorizeVoter(
            1,
            voter1.address
        );


        await voting.startElection(1);


        await voting
            .connect(voter1)
            .castVote(1, 1);


        await expect(
            voting
                .connect(voter1)
                .castVote(1, 2)
        ).to.be.revertedWith(
            "Voter has already voted"
        );

    });


    // ============================================================
    // TEST 8 — UNAUTHORIZED VOTER
    // ============================================================

    it("should reject an unauthorized voter", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.startElection(1);


        await expect(
            voting
                .connect(unauthorizedVoter)
                .castVote(1, 1)
        ).to.be.revertedWith(
            "Voter is not authorized"
        );

    });


    // ============================================================
    // TEST 9 — INVALID CANDIDATE
    // ============================================================

    it("should reject an invalid candidate", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.authorizeVoter(
            1,
            voter1.address
        );


        await voting.startElection(1);


        await expect(
            voting
                .connect(voter1)
                .castVote(1, 99)
        ).to.be.revertedWith(
            "Invalid candidate"
        );

    });


    // ============================================================
    // TEST 10 — END ELECTION
    // ============================================================

    it("should end an active election", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.startElection(1);


        await voting.endElection(1);


        const status =
            await voting.getElectionStatus(1);


        expect(status)
            .to.equal(3);

    });


    // ============================================================
    // TEST 11 — PUBLISH RESULTS
    // ============================================================

    it("should publish election results", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.startElection(1);


        await voting.endElection(1);


        await voting.publishResults(1);


        const status =
            await voting.getElectionStatus(1);


        expect(status)
            .to.equal(4);

    });


    // ============================================================
    // TEST 12 — WINNER
    // ============================================================

    it("should determine the winner", async function () {

        const currentTime =
            Math.floor(Date.now() / 1000);


        await voting.createElection(
            "College Election",
            "Student election",
            currentTime - 60,
            currentTime + 3600
        );


        await voting.registerCandidate(
            1,
            "Alice",
            "Party A",
            "Star",
            "Manifesto A"
        );


        await voting.registerCandidate(
            1,
            "Bob",
            "Party B",
            "Circle",
            "Manifesto B"
        );


        await voting.authorizeVoter(
            1,
            voter1.address
        );


        await voting.authorizeVoter(
            1,
            voter2.address
        );


        await voting.startElection(1);


        await voting
            .connect(voter1)
            .castVote(1, 1);


        await voting
            .connect(voter2)
            .castVote(1, 1);


        const winner =
            await voting.getWinner(1);


        expect(winner[0])
            .to.equal(1);


        expect(winner[1])
            .to.equal("Alice");


        expect(winner[2])
            .to.equal(2);

    });

});