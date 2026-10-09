-- ============================================================
-- Secure Decentralized E-Voting System
-- Database Schema
-- PostgreSQL
-- ============================================================

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'VOTER',

    voter_id VARCHAR(50) UNIQUE,

    wallet_address VARCHAR(100) UNIQUE,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'VOTER'))
);


-- ============================================================
-- 2. ELECTIONS
-- ============================================================

CREATE TABLE elections (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    start_time TIMESTAMP NOT NULL,

    end_time TIMESTAMP NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    contract_address VARCHAR(100),

    created_by BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT elections_status_check
        CHECK (
            status IN (
                'DRAFT',
                'UPCOMING',
                'ACTIVE',
                'ENDED',
                'CANCELLED'
            )
        ),

    CONSTRAINT elections_time_check
        CHECK (end_time > start_time),

    CONSTRAINT fk_elections_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);


-- ============================================================
-- 3. CANDIDATES
-- ============================================================

CREATE TABLE candidates (
    id BIGSERIAL PRIMARY KEY,

    election_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,

    party VARCHAR(100),

    symbol VARCHAR(255),

    image_url TEXT,

    manifesto TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidates_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 4. VOTER ELECTION AUTHORIZATION
-- ============================================================

CREATE TABLE voter_election_authorizations (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    election_id BIGINT NOT NULL,

    is_authorized BOOLEAN NOT NULL DEFAULT FALSE,

    has_voted BOOLEAN NOT NULL DEFAULT FALSE,

    authorized_at TIMESTAMP,

    voted_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_authorization_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_authorization_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_voter_election
        UNIQUE (user_id, election_id)
);


-- ============================================================
-- 5. BLOCKCHAIN TRANSACTIONS
-- ============================================================

CREATE TABLE blockchain_transactions (
    id BIGSERIAL PRIMARY KEY,

    election_id BIGINT NOT NULL,

    tx_hash VARCHAR(100) NOT NULL UNIQUE,

    block_number BIGINT,

    wallet_address VARCHAR(100),

    gas_used NUMERIC(30, 0),

    transaction_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    confirmed_at TIMESTAMP,

    CONSTRAINT fk_transaction_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE,

    CONSTRAINT transaction_status_check
        CHECK (
            transaction_status IN (
                'PENDING',
                'CONFIRMED',
                'FAILED'
            )
        )
);


-- ============================================================
-- 6. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT,

    action VARCHAR(100) NOT NULL,

    description TEXT,

    ip_address INET,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================================
-- 7. INDEXES
-- ============================================================

CREATE INDEX idx_users_email
    ON users(email);

CREATE INDEX idx_users_wallet
    ON users(wallet_address);

CREATE INDEX idx_elections_status
    ON elections(status);

CREATE INDEX idx_candidates_election
    ON candidates(election_id);

CREATE INDEX idx_authorization_user
    ON voter_election_authorizations(user_id);

CREATE INDEX idx_authorization_election
    ON voter_election_authorizations(election_id);

CREATE INDEX idx_transactions_election
    ON blockchain_transactions(election_id);

CREATE INDEX idx_transactions_hash
    ON blockchain_transactions(tx_hash);

CREATE INDEX idx_audit_user
    ON audit_logs(user_id);

CREATE INDEX idx_audit_created_at
    ON audit_logs(created_at);


-- ============================================================
-- 8. SYMBOLS REGISTRY
-- ============================================================

CREATE TABLE symbols (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- 9. ELECTION OFFICERS
-- ============================================================

CREATE TABLE election_officers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    jurisdiction_level VARCHAR(50) NOT NULL CHECK (jurisdiction_level IN ('NATIONAL', 'STATE', 'DISTRICT', 'CONSTITUENCY')),
    state VARCHAR(100),
    district VARCHAR(100),
    constituency_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL
);


-- ============================================================
-- 10. CITIZEN GRIEVANCES
-- ============================================================

CREATE TABLE grievances (
    id BIGSERIAL PRIMARY KEY,
    complainant_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    constituency_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ASSIGNED', 'INVESTIGATION', 'REVIEW', 'RESOLVED')),
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 11. COMPLIANCE & VIOLATIONS
-- ============================================================

CREATE TABLE compliance_violations (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    reporter_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED')),
    suspect VARCHAR(255),
    investigation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 12. SECURITY INCIDENTS
-- ============================================================

CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'ASSIGNED', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 13. VERSION HISTORY / AUDIT
-- ============================================================

CREATE TABLE version_history (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);


-- ============================================================
-- 14. EMERGENCY RE-POLLS
-- ============================================================

CREATE TABLE repolls (
    id BIGSERIAL PRIMARY KEY,
    election_id BIGINT REFERENCES elections(id) ON DELETE CASCADE,
    constituency_id BIGINT REFERENCES constituencies(id) ON DELETE CASCADE,
    polling_station_id BIGINT REFERENCES polling_stations(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 15. ELECTION PHASES
-- ============================================================

CREATE TABLE election_phases (
    id BIGSERIAL PRIMARY KEY,
    election_id BIGINT REFERENCES elections(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    polling_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED', 'SUSPENDED')),
    constituencies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- DATABASE COMPLETE
-- ============================================================