# Blockchain and Smart Contracts

The core integrity and transparency guarantees of the e-voting platform are backed by the Ethereum-compatible local Hardhat network and the `EVoting.sol` smart contract.

## 1. Smart Contract: `EVoting.sol`

The contract is written in Solidity and defines the complete state validation mechanisms.

### Enums and Structs
* **`ElectionStatus`**: Enforces strict lifecycle phases on-chain:
  * `DRAFT` (0)
  * `UPCOMING` (1)
  * `ACTIVE` (2)
  * `ENDED` (3)
  * `RESULTS_PUBLISHED` (4)
* **`Candidate`**: id, name, party, symbol, manifesto, voteCount, exists.
* **`Election`**: id, title, description, startTime, endTime, status, exists.

### Modifiers
* `onlyAdmin()`: Limits critical tasks (election creation, voter authorization, candidate registry) to the contract deployer address.
* `electionExists()`: Reverts transactions referencing invalid or uninstantiated elections.

---

## 2. Core Functions

```solidity
function createElection(
    string memory title,
    string memory description,
    uint256 startTime,
    uint256 endTime
) external onlyAdmin returns (uint256)
```
Deploys a new election metadata schema block on the blockchain and initializes its state to `UPCOMING`.

```solidity
function registerCandidate(
    uint256 electionId,
    string memory name,
    string memory party,
    string memory symbol,
    string memory manifesto
) external onlyAdmin electionExists(electionId) returns (uint256)
```
Appends a candidate structure array entry to the election block. Can only execute during the `UPCOMING` phase.

```solidity
function authorizeVoter(
    uint256 electionId,
    address voter
) external onlyAdmin electionExists(electionId)
```
Grants the specified public key authorization permissions inside the `authorizedVoters[electionId]` mapping on-chain.

```solidity
function castVote(
    uint256 electionId,
    uint256 candidateId
) external electionExists(electionId)
```
Signs and broadcasts a voter ballot choice. Enforces the following validations:
* Election status must be exactly `ACTIVE`.
* Current block timestamp must be between the election's start and end times.
* The sender address (`msg.sender`) must be authorized inside `authorizedVoters[electionId]`.
* The sender must not have voted previously (`hasVoted[electionId][msg.sender] == false`).
* The candidate ID must exist.
Upon validation, increments the candidate's `voteCount` and toggles `hasVoted` to `true`.
