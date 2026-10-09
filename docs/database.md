# Database Architecture & Schema

The PostgreSQL database acts as the primary relational persistence store, retaining user accounts, draft elections, candidate profiles, and system audit logs.

## 1. Table Specifications

### `users`
Retains accounts for both `ADMIN` and `VOTER` roles.
* `id` (SERIAL PRIMARY KEY)
* `name` (VARCHAR)
* `email` (VARCHAR UNIQUE)
* `password` (VARCHAR, hashed using bcrypt)
* `role` (VARCHAR: `ADMIN` or `VOTER`)
* `wallet_address` (VARCHAR UNIQUE, registered voter public key)
* `voter_id` (VARCHAR UNIQUE)
* `is_active` (BOOLEAN DEFAULT TRUE)
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### `elections`
Retains database records of created elections.
* `id` (SERIAL PRIMARY KEY)
* `title` (VARCHAR)
* `description` (TEXT)
* `start_time` (TIMESTAMP)
* `end_time` (TIMESTAMP)
* `status` (VARCHAR: `DRAFT`, `UPCOMING`, `ACTIVE`, `ENDED`, `RESULTS_PUBLISHED`)
* `blockchain_election_id` (INTEGER, matching smart contract ID)
* `contract_address` (VARCHAR, address of deployed `EVoting.sol` instance)
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### `candidates`
Stores profiles for registered candidates in each election.
* `id` (SERIAL PRIMARY KEY)
* `election_id` (INTEGER REFERENCES `elections(id) ON DELETE CASCADE`)
* `name` (VARCHAR)
* `party` (VARCHAR)
* `symbol` (VARCHAR, name/description of candidate logo icon)
* `manifesto` (TEXT)
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### `voter_election_authorizations`
Enforces voter permissions per election.
* `id` (SERIAL PRIMARY KEY)
* `user_id` (INTEGER REFERENCES `users(id) ON DELETE CASCADE`)
* `election_id` (INTEGER REFERENCES `elections(id) ON DELETE CASCADE`)
* `is_authorized` (BOOLEAN DEFAULT FALSE)
* `has_voted` (BOOLEAN DEFAULT FALSE)
* `authorized_at` (TIMESTAMP)
* `voted_at` (TIMESTAMP)

### `blockchain_transactions`
Audits on-chain transaction metrics.
* `id` (SERIAL PRIMARY KEY)
* `election_id` (INTEGER REFERENCES `elections(id)`)
* `tx_hash` (VARCHAR UNIQUE)
* `block_number` (INTEGER)
* `wallet_address` (VARCHAR)
* `gas_used` (VARCHAR)
* `transaction_status` (VARCHAR: `PENDING`, `CONFIRMED`, `FAILED`)
* `confirmed_at` (TIMESTAMP)

### `audit_logs`
Central security trail logging all user actions.
* `id` (SERIAL PRIMARY KEY)
* `user_id` (INTEGER REFERENCES `users(id)`)
* `action` (VARCHAR, e.g., `LOGIN`, `VOTE_CAST`, `VOTER_AUTHORIZED`)
* `description` (TEXT)
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

---

## 2. Integrity and Synchronization Rules
* **Foreign Key Safeguards:** Cascades delete events on `candidates` and `voter_election_authorizations` if an election is deleted.
* **Double-Voting Prevention:** The database updates `has_voted = TRUE` only upon matching a valid mined transaction hash from Hardhat.
