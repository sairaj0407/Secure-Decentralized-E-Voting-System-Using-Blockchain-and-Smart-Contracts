# Security Architecture Audit

The system enforces multi-layered defense to maintain confidentiality, integrity, and non-repudiation of vote tallies.

## 1. Authentication & Role Permissions
* **JSON Web Tokens (JWT):** Express APIs authenticate voter and admin request contexts using signed JWT payloads. Tokens expire in 2 hours to limit session vulnerability windows.
* **Role Guards:** Routes are secured using `authMiddleware` verifying role permissions:
  * `/api/admin/*` endpoints strictly require `role === 'ADMIN'`.
  * Voting transactions are limited to `role === 'VOTER'`.

---

## 2. Vote Validation & Integrity Guardrails
* **Voter Key Matching:** The backend matches the caller's JWT key with their registered wallet address. If a voter attempts to submit a transaction signed by an unauthorized key, the API rejects it.
* **MetaMask Transaction Verification:** When client-side signatures are enabled, the voter dashboard submits the transaction hash to the Express backend. The backend resolves the block receipt on-chain and verifies:
  1. The transaction status is `1` (Success).
  2. The target matches the configured `EVoting` contract address.
  3. The sender (`tx.from`) matches the voter's registered public key.
  4. The decoded method inputs match the requested `electionId` and `candidateId`.
  Only upon successful verification does the backend record the vote count in PostgreSQL.
* **Private Key Insulation:** High-value smart contract deployer private keys are isolated inside backend `.env` variables and are never transmitted to React renderer clients or saved in localStorage.
