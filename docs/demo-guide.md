# Demonstration and Viva Guide

Use this sequence to verify and demonstrate all features of the decentralized e-voting platform to evaluators.

## 1. Startup Checklist
* Start the local Hardhat Node.
* Launch the PostgreSQL backend server on port 5000.
* Start the Vite front-end.
* Ensure MetaMask is connected to `http://localhost:8545` (Chain ID 31337) and import Hardhat accounts (Account #0 for Admin, Account #1 for Test Voter).

---

## 2. Interactive Demo Steps

### Step 1: Health Diagnostics Check
Open the application. The system diagnostic bar should display green `ONLINE` badges for all services: Backend API, PostgreSQL Database, and Blockchain Node.

### Step 2: Administrative Controls (Login as Admin)
1. Navigate to Login and enter Admin credentials:
   * **Email:** `admin@evoting.local`
   * **Password:** `Admin@12345`
2. Navigate to **Elections** tab and view the demo election: **Blockchain Voting Test Election 2026** (PostgreSQL ID `14`, On-Chain ID `1`).
3. Click on the election to view metadata: Title, status indicator (`UPCOMING`), smart contract address, registered candidates, and authorized voter lists.

### Step 3: Candidate & Voter Registry
1. Point out the two registered candidates: **Rahul Sharma** (Student Unity) and **Priya Patil** (Student First).
2. Point out that **Test Voter** (`voter@test.com`) is authorized on-chain for this election.
3. Click **Start Election** inside the admin console. Explain that this sends an `onlyAdmin` transaction to transition the state on-chain to `ACTIVE`.

### Step 4: Cast Vote (Login as Voter)
1. Logout of the admin account and login as Voter:
   * **Email:** `voter@test.com`
   * **Password:** `Voter@12345`
2. The dashboard will show the active election countdown and prompt MetaMask connection.
3. Connect the imported voter wallet (`0x70997970c51812dc3a010c7d01b50e0d17dc79c8`).
4. Select **Rahul Sharma** and click **Cast Vote**. Approve the transaction in MetaMask.
5. Once mined, show the transaction receipt, block number, and the synchronized status update in the UI.
6. Try to vote again. Confirm that the application rejects the attempt both client-side (button disabled) and server-side (conflict exception).

### Step 5: Tallying & Results Publication
1. Login back as Admin.
2. Click **End Election** (closes voting phase).
3. Click **Calculate & Verify Results** (cross-checks database votes with blockchain tallies).
4. Click **Publish Results**. Log back in as Voter to view the published results and charts.
