// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/**
 * @title Secure Decentralized E-Voting System
 * @dev Smart contract for secure and transparent elections.
 */
contract EVoting {

    // ============================================================
    // ENUMS
    // ============================================================

    enum ElectionStatus {
        DRAFT,
        UPCOMING,
        ACTIVE,
        ENDED,
        RESULTS_PUBLISHED
    }


    // ============================================================
    // STRUCTS
    // ============================================================

    struct Candidate {
        uint256 id;
        string name;
        string party;
        string symbol;
        string manifesto;
        uint256 voteCount;
        bool exists;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        ElectionStatus status;
        bool exists;
    }


    // ============================================================
    // STATE VARIABLES
    // ============================================================

    address public admin;

    uint256 private nextElectionId = 1;

    mapping(uint256 => Election) public elections;

    mapping(uint256 => Candidate[]) private electionCandidates;

    mapping(uint256 => mapping(address => bool)) public authorizedVoters;

    mapping(uint256 => mapping(address => bool)) public hasVoted;


    // ============================================================
    // EVENTS
    // ============================================================

    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event CandidateRegistered(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name
    );

    event VoterAuthorized(
        uint256 indexed electionId,
        address indexed voter
    );

    event VoteCast(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        address indexed voter
    );

    event ElectionStarted(
        uint256 indexed electionId
    );

    event ElectionEnded(
        uint256 indexed electionId
    );

    event ResultsPublished(
        uint256 indexed electionId
    );


    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier onlyAdmin() {
        require(
            msg.sender == admin,
            "Only admin can perform this action"
        );
        _;
    }

    modifier electionExists(uint256 electionId) {
        require(
            elections[electionId].exists,
            "Election does not exist"
        );
        _;
    }


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor() {
        admin = msg.sender;
    }


    // ============================================================
    // CREATE ELECTION
    // ============================================================

    function createElection(
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime
    )
        external
        onlyAdmin
        returns (uint256)
    {
        require(
            bytes(title).length > 0,
            "Election title required"
        );

        require(
            endTime > startTime,
            "Invalid election time"
        );

        require(
            endTime > block.timestamp,
            "Election must end in future"
        );

        uint256 electionId = nextElectionId;

        elections[electionId] = Election({
            id: electionId,
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            status: ElectionStatus.UPCOMING,
            exists: true
        });

        nextElectionId++;

        emit ElectionCreated(
            electionId,
            title,
            startTime,
            endTime
        );

        return electionId;
    }


    // ============================================================
    // REGISTER CANDIDATE
    // ============================================================

    function registerCandidate(
        uint256 electionId,
        string memory name,
        string memory party,
        string memory symbol,
        string memory manifesto
    )
        external
        onlyAdmin
        electionExists(electionId)
        returns (uint256)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.UPCOMING,
            "Candidates cannot be added now"
        );

        require(
            bytes(name).length > 0,
            "Candidate name required"
        );

        uint256 candidateId =
            electionCandidates[electionId].length + 1;

        electionCandidates[electionId].push(
            Candidate({
                id: candidateId,
                name: name,
                party: party,
                symbol: symbol,
                manifesto: manifesto,
                voteCount: 0,
                exists: true
            })
        );

        emit CandidateRegistered(
            electionId,
            candidateId,
            name
        );

        return candidateId;
    }


    // ============================================================
    // AUTHORIZE VOTER
    // ============================================================

    function authorizeVoter(
        uint256 electionId,
        address voter
    )
        external
        onlyAdmin
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.UPCOMING ||
            election.status == ElectionStatus.ACTIVE,
            "Election is neither upcoming nor active"
        );

        require(
            voter != address(0),
            "Invalid voter address"
        );

        if (!authorizedVoters[electionId][voter]) {
            authorizedVoters[electionId][voter] = true;

            emit VoterAuthorized(
                electionId,
                voter
            );
        }
    }

    function isVoterAuthorized(
        uint256 electionId,
        address voter
    )
        external
        view
        electionExists(electionId)
        returns (bool)
    {
        return authorizedVoters[electionId][voter];
    }

    function hasVoterVoted(
        uint256 electionId,
        address voter
    )
        external
        view
        electionExists(electionId)
        returns (bool)
    {
        return hasVoted[electionId][voter];
    }


    // ============================================================
    // START ELECTION
    // ============================================================

    function startElection(
        uint256 electionId
    )
        external
        onlyAdmin
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.UPCOMING,
            "Election cannot be started"
        );

        require(
            electionCandidates[electionId].length >= 2,
            "At least two candidates required"
        );

        election.status = ElectionStatus.ACTIVE;

        emit ElectionStarted(electionId);
    }


    // ============================================================
    // CAST VOTE
    // ============================================================

    function castVote(
        uint256 electionId,
        uint256 candidateId
    )
        external
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.ACTIVE,
            "Election is not active"
        );

        require(
            block.timestamp >= election.startTime,
            "Election has not started"
        );

        require(
            block.timestamp <= election.endTime,
            "Election has ended"
        );

        require(
            authorizedVoters[electionId][msg.sender],
            "Voter is not authorized"
        );

        require(
            !hasVoted[electionId][msg.sender],
            "Voter has already voted"
        );

        require(
            candidateId > 0 &&
            candidateId <= electionCandidates[electionId].length,
            "Invalid candidate"
        );

        electionCandidates[electionId][candidateId - 1].voteCount++;

        hasVoted[electionId][msg.sender] = true;

        emit VoteCast(
            electionId,
            candidateId,
            msg.sender
        );
    }


    // ============================================================
    // CAST VOTE FOR (OFFICIAL RELAYER FOR VERIFIED ELECTORS)
    // ============================================================

    function castVoteFor(
        uint256 electionId,
        uint256 candidateId,
        address voter
    )
        external
        onlyAdmin
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.ACTIVE,
            "Election is not active"
        );

        require(
            block.timestamp >= election.startTime,
            "Election has not started"
        );

        require(
            block.timestamp <= election.endTime,
            "Election has ended"
        );

        require(
            voter != address(0),
            "Invalid voter address"
        );

        require(
            authorizedVoters[electionId][voter],
            "Voter is not authorized"
        );

        require(
            !hasVoted[electionId][voter],
            "Voter has already voted"
        );

        require(
            candidateId > 0 &&
            candidateId <= electionCandidates[electionId].length,
            "Invalid candidate"
        );

        electionCandidates[electionId][candidateId - 1].voteCount++;

        hasVoted[electionId][voter] = true;

        emit VoteCast(
            electionId,
            candidateId,
            voter
        );
    }


    // ============================================================
    // END ELECTION
    // ============================================================

    function endElection(
        uint256 electionId
    )
        external
        onlyAdmin
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.ACTIVE,
            "Election is not active"
        );

        election.status = ElectionStatus.ENDED;

        emit ElectionEnded(electionId);
    }


    // ============================================================
    // PUBLISH RESULTS
    // ============================================================

    function publishResults(
        uint256 electionId
    )
        external
        onlyAdmin
        electionExists(electionId)
    {
        Election storage election = elections[electionId];

        require(
            election.status == ElectionStatus.ENDED,
            "Election must be ended first"
        );

        election.status = ElectionStatus.RESULTS_PUBLISHED;

        emit ResultsPublished(electionId);
    }


    // ============================================================
    // GET CANDIDATE
    // ============================================================

    function getCandidate(
        uint256 electionId,
        uint256 candidateId
    )
        external
        view
        electionExists(electionId)
        returns (Candidate memory)
    {
        require(
            candidateId > 0 &&
            candidateId <= electionCandidates[electionId].length,
            "Invalid candidate"
        );

        return electionCandidates[electionId][candidateId - 1];
    }


    // ============================================================
    // GET ALL CANDIDATES
    // ============================================================

    function getCandidates(
        uint256 electionId
    )
        external
        view
        electionExists(electionId)
        returns (Candidate[] memory)
    {
        return electionCandidates[electionId];
    }


    // ============================================================
    // GET VOTE COUNT
    // ============================================================

    function getVoteCount(
        uint256 electionId,
        uint256 candidateId
    )
        external
        view
        electionExists(electionId)
        returns (uint256)
    {
        require(
            candidateId > 0 &&
            candidateId <= electionCandidates[electionId].length,
            "Invalid candidate"
        );

        return electionCandidates[electionId][candidateId - 1].voteCount;
    }


    // ============================================================
    // GET WINNER
    // ============================================================

    function getWinner(
        uint256 electionId
    )
        external
        view
        electionExists(electionId)
        returns (
            uint256 winnerId,
            string memory winnerName,
            uint256 winnerVotes
        )
    {
        require(
            electionCandidates[electionId].length > 0,
            "No candidates"
        );

        uint256 winningCandidateId = 0;
        uint256 highestVotes = 0;

        for (
            uint256 i = 0;
            i < electionCandidates[electionId].length;
            i++
        ) {
            if (
                electionCandidates[electionId][i].voteCount
                > highestVotes
            ) {
                highestVotes =
                    electionCandidates[electionId][i].voteCount;

                winningCandidateId =
                    electionCandidates[electionId][i].id;
            }
        }

        Candidate memory winner =
            electionCandidates[electionId][
                winningCandidateId - 1
            ];

        return (
            winner.id,
            winner.name,
            winner.voteCount
        );
    }


    // ============================================================
    // GET ELECTION
    // ============================================================

    function getElection(
        uint256 electionId
    )
        external
        view
        electionExists(electionId)
        returns (Election memory)
    {
        return elections[electionId];
    }


    // ============================================================
    // GET ELECTION STATUS
    // ============================================================

    function getElectionStatus(
        uint256 electionId
    )
        external
        view
        electionExists(electionId)
        returns (ElectionStatus)
    {
        return elections[electionId].status;
    }


    // ============================================================
    // INTERNAL HELPER
    // ============================================================

    function electionStatusIsUpcoming(
        uint256 electionId
    )
        internal
        view
        returns (bool)
    {
        return
            elections[electionId].status
            == ElectionStatus.UPCOMING;
    }
}