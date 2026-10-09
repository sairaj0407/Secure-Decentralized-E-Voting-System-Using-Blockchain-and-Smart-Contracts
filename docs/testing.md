# Verification & Testing Protocols

The system includes automated unit and integration verification testing scripts covering the complete blockchain transaction and database persistence cycle.

## 1. Smart Contract Unit Tests

Unit tests are written using Hardhat, Mocha, and Chai to validate security boundaries of `EVoting.sol`:
* **Path:** `blockchain/test/EVoting.ts` or `blockchain/test/EVoting.js`
* **Coverage:**
  * Ensures non-admin accounts are rejected for admin mutations.
  * Validates that voters cannot cast duplicate ballots (asserts on-chain reverts).
  * Confirms invalid candidate or election references are reverted correctly.
  * Verifies election time constraint boundaries.

To execute contract unit tests:
```bash
cd blockchain
npx hardhat test
```

---

## 2. E2E Lifecycle Integration Test

An end-to-end Node.js validation script verifies backend controller routing, PostgreSQL updates, and Hardhat network transaction mining:
* **Path:** [`backend/scripts/test-lifecycle-flow.js`](file:///d:/Secure%20Decentralized%20E-Voting%20System%20Using%20Blockchain%20and%20Smart%20Contracts/backend/scripts/test-lifecycle-flow.js)
* **Execution Flow:**
  1. Instantiates or clears database parameters.
  2. Queries the deployed contract address.
  3. Transitions status indicators (`Upcoming` ➔ `Active`).
  4. Casts a vote transaction using a generated voter wallet.
  5. Confirms the transaction block is mined on-chain.
  6. Verifies that voter state fields in PostgreSQL are toggled (`has_voted = TRUE`).
  7. Asserts that subsequent votes from the same user trigger a HTTP `409 Conflict`.
  8. Ends the election, checks winner values, and publishes results.

To execute integration verification:
```bash
node backend/scripts/test-lifecycle-flow.js
```
