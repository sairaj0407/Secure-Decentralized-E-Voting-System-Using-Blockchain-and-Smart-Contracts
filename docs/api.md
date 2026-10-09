# Backend API Specification

The Express backend exposes secure REST endpoints for clients. All mutations require JSON Web Token (JWT) authorization headers.

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user profile.
* **Payload:** `{ "name", "email", "password", "walletAddress", "role" }`
* **Response (201):** `{ "success": true, "message": "User registered successfully." }`

### `POST /api/auth/login`
Authenticates a user profile and returns a JWT credentials token.
* **Payload:** `{ "email", "password" }`
* **Response (200):** `{ "success": true, "token": "<JWT_STRING>", "user": { "id", "name", "email", "role", "wallet_address" } }`

---

## 2. Election Endpoints

### `POST /api/elections` (ADMIN Only)
Instantiates an election in PostgreSQL and broadcasts it to the contract on-chain.
* **Payload:** `{ "title", "description", "startTime", "endTime" }`
* **Response (201):** `{ "success": true, "electionId": 14, "blockchainElectionId": 1 }`

### `POST /api/elections/:id/start` (ADMIN Only)
Transitions an election status indicator to `ACTIVE` on both database and smart contract.
* **Response (200):** `{ "success": true, "message": "Election started successfully." }`

### `POST /api/elections/:id/end` (ADMIN Only)
Transitions status indicator to `ENDED`.
* **Response (200):** `{ "success": true, "message": "Election ended successfully." }`

---

## 3. Voter Authorization & Voting Endpoints

### `POST /api/authorizations/authorize` (ADMIN Only)
Authorizes a voter wallet public key for a designated election on-chain and updates PostgreSQL.
* **Payload:** `{ "electionId", "userId" }`
* **Response (200):** `{ "success": true, "message": "Voter authorized successfully." }`

### `POST /api/votes/cast` (VOTER Only)
Casts a ballot choice. Supports client-signed (MetaMask transaction hash verification) or backend-signed (fallback signatures for development).
* **Payload:** `{ "electionId", "candidateId", "transactionHash" }`
* **Response (211):** `{ "success": true, "message": "Vote cast successfully on blockchain." }`

---

## 4. Diagnostics & Analytics

### `GET /api/health` (Public)
Retrieves the real-time status signals of backend dependencies.
* **Response (200):**
```json
{
  "overallStatus": "ONLINE",
  "services": {
    "database": { "status": "ONLINE" },
    "blockchain": { "status": "ONLINE", "blockNumber": 12 },
    "analytics": { "status": "ONLINE" }
  }
}
```
