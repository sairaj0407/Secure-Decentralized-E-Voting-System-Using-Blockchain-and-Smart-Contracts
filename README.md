# Secure Decentralized E-Voting System Using Blockchain and Smart Contracts

A state-of-the-art decentralized electronic voting platform combining a full-stack web application with Ethereum-compatible smart contracts, a PostgreSQL relational model, real-time analytics, and containerized deployment.

---

## Key Features
* **Voter Verification & Authorization:** Dual-layer verification mapping JSON Web Tokens (JWT) with authorized Ethereum wallet addresses.
* **On-Chain Election Lifecycle:** Smart contract-driven state machine transitions (`Upcoming` ➔ `Active` ➔ `Ended` ➔ `Published`).
* **Decentralized Auditability:** Real-time synchronization of voting events, storing gas metrics and transaction receipts in PostgreSQL for audit checks.
* **MetaMask Integration:** Browser-based wallet verification validating active addresses against voter profiles with dynamic fallback signatures.
* **Turnout Analytics:** Automated Python-based reporting engine mapping voting metrics, timeline trends, peak hours, and demographic charts.
* **Multi-Container Orchestration:** Single-command local deployment with Docker Compose.

---

## Project Structure
* `/blockchain` — Hardhat development environment, Solidity contracts, and deploy scripts.
* `/backend` — Node.js + Express API server, controllers, schema mapping, and database handlers.
* `/frontend` — Vite + React dashboard featuring verified MetaMask voting.
* `/analytics` — Python vote analysis, reporting scripts, and data visualizers.
* `/database` — Relational schema definitions and seed data.

---

## Prerequisites
Ensure the following are installed:
* [Node.js (v18+)](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/)
* [Python (3.10+)](https://www.python.org/)
* [Docker Desktop](https://www.docker.com/) (Optional, for containerized run)
* [MetaMask Extension](https://metamask.io/) (For browser voting)

---

## Local Development Setup

### 1. Database Initialization
Create a PostgreSQL database named `evoting` and run the initialization scripts:
```bash
psql -U postgres -d evoting -f database/schema.sql
psql -U postgres -d evoting -f database/seed.sql
```

### 2. Smart Contract Deployment
Install blockchain dependencies, start the local node, and deploy the contracts:
```bash
cd blockchain
npm install
# Start local node (keep terminal open)
npx hardhat node
# Deploy contract in a new terminal
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Backend API Server Setup
Create a `.env` file in the `backend/` folder based on `.env.example` and configure credentials:
```bash
cd backend
npm install
npm start
```

### 4. Frontend Web Client Setup
Install packages and start the Vite server:
```bash
cd frontend
npm install
npm run dev
```

---

## Running Automated Integration Tests
An end-to-end script tests candidate registration, Turnout Windows, MetaMask/backend voting signature validation, duplicate voter rejection, on-chain results calculation, and results publication:
```bash
node backend/scripts/test-lifecycle-flow.js
```

---

## Generating Election Analytics
The reporting engine processes PostgreSQL records and outputs demographics, timeline trend-lines, and peak hours charts:
```bash
python analytics/analyze_votes.py
```
*Charts will be exported as images, and the report will be compiled in `analytics/election_summary.md`.*

---

## Docker Compose Deployment
To compile and launch the database, local node, backend API, and React frontend concurrently:
```bash
docker compose up --build
```
*Access the voter interface at `http://localhost:5173` and the Express API at `http://localhost:5000`.*

---

## Windows Desktop Application (Electron)

The React web application is wrapped as a native Windows desktop application with secure IPC interfaces and system diagnostics:

### 1. Running the Desktop Shell in Development Mode
Start the Hardhat node, backend API server, and Vite dev server, then launch the Electron wrapper:
```bash
cd frontend
npm run electron
```

### 2. Packaging the Windows Desktop Installer
To compile the production React assets and bundle the standalone installer (`Secure-EVoting-System-Setup.exe`):
```bash
cd frontend
npm run dist
```
*The compiled setup file is outputted to `frontend/dist-desktop/Secure E-Voting System Setup 0.0.0.exe`.*

*Note: Windows file indexing and scanning locks can occasionally trigger `EPERM` rename errors. The compilation process utilizes a programmatic build wrapper (`build-desktop.cjs`) that automatically intercepts filesystem rename commands and retries them with a 1-second delay, ensuring reliable packaging.*

