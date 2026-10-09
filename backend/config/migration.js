const pool = require("./database");

async function runMigrations() {
    console.log("[Migration] Running database schema migration...");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Create table parties if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS parties (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                abbreviation VARCHAR(20) NOT NULL UNIQUE,
                symbol VARCHAR(100) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
                contact_info TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Create table constituencies if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS constituencies (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                level VARCHAR(50) NOT NULL CHECK (level IN ('STATE', 'DISTRICT', 'CONSTITUENCY', 'WARD')),
                parent_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Create table polling_stations if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS polling_stations (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                address TEXT NOT NULL,
                constituency_id BIGINT REFERENCES constituencies(id) ON DELETE CASCADE,
                capacity INTEGER DEFAULT 1000,
                assigned_officer_id BIGINT,
                status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Create table voter_receipts if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS voter_receipts (
                id BIGSERIAL PRIMARY KEY,
                election_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                receipt_code VARCHAR(100) NOT NULL UNIQUE,
                tx_hash VARCHAR(100) NOT NULL,
                block_number BIGINT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Update users table columns
        // Drop existing role check constraint if exists
        await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
        await client.query(`
            ALTER TABLE users 
            ADD CONSTRAINT users_role_check 
            CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSIONER', 'STATE_ELECTION_OFFICER', 'DISTRICT_ELECTION_OFFICER', 'RETURNING_OFFICER', 'PRESIDING_OFFICER', 'POLLING_OFFICER', 'OBSERVER', 'AUDITOR', 'CANDIDATE', 'VOTER'))
        `);

        // Add additional fields to users
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'INACTIVE'))`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS constituency_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS polling_station_id BIGINT REFERENCES polling_stations(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS relative_name VARCHAR(150)`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS relative_type VARCHAR(50)`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20)`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10)`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS state_id BIGINT REFERENCES states(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS assembly_constituency_id BIGINT REFERENCES assembly_constituencies(id) ON DELETE SET NULL`);

        await client.query(`ALTER TABLE polling_stations ADD COLUMN IF NOT EXISTS state_id BIGINT REFERENCES states(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE polling_stations ADD COLUMN IF NOT EXISTS district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE polling_stations ADD COLUMN IF NOT EXISTS assembly_constituency_id BIGINT REFERENCES assembly_constituencies(id) ON DELETE SET NULL`);

        // 6. Update elections table columns
        await client.query(`ALTER TABLE elections DROP CONSTRAINT IF EXISTS elections_status_check`);
        await client.query(`
            ALTER TABLE elections 
            ADD CONSTRAINT elections_status_check 
            CHECK (status IN ('DRAFT', 'NOMINATION_OPEN', 'NOMINATION_CLOSED', 'SCRUTINY', 'WITHDRAWAL', 'CANDIDATE_FINALIZED', 'UPCOMING', 'ACTIVE', 'VOTING_CLOSED', 'ENDED', 'COMPLETED', 'COUNTING', 'RESULTS_PUBLISHED', 'CANCELLED', 'ARCHIVED'))
        `);

        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS election_code VARCHAR(50) UNIQUE`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS election_type VARCHAR(50) DEFAULT 'General'`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS election_level VARCHAR(50) DEFAULT 'National'`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100)`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS state VARCHAR(100)`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS district VARCHAR(100)`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS constituency VARCHAR(100)`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS ward VARCHAR(50)`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS polling_area VARCHAR(100)`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS nomination_start TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS nomination_end TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS scrutiny_date TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS withdrawal_date TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS campaign_period_start TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS campaign_period_end TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS result_date TIMESTAMP`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS max_selections INTEGER DEFAULT 1`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS min_selections INTEGER DEFAULT 1`);
        await client.query(`ALTER TABLE elections ADD COLUMN IF NOT EXISTS nota_enabled BOOLEAN DEFAULT TRUE`);

        // 7. Update candidates table columns
        await client.query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'UNDER_SCRUTINY', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'FINAL'))`);
        await client.query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS party_id BIGINT REFERENCES parties(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS biography TEXT`);
        await client.query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        await client.query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS blockchain_candidate_id INTEGER`);
        await client.query(`ALTER TABLE parties ADD COLUMN IF NOT EXISTS leader VARCHAR(255)`);
        await client.query(`ALTER TABLE reference_parties ADD COLUMN IF NOT EXISTS leader VARCHAR(255)`);

        // 8. Add circular reference for assigned_officer_id to users in polling_stations
        await client.query(`
            ALTER TABLE polling_stations 
            DROP CONSTRAINT IF EXISTS fk_polling_station_officer,
            ADD CONSTRAINT fk_polling_station_officer FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL
        `);

        // 9. Add foreign key for voter_receipts
        await client.query(`
            ALTER TABLE voter_receipts 
            DROP CONSTRAINT IF EXISTS fk_receipt_election,
            ADD CONSTRAINT fk_receipt_election FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
            DROP CONSTRAINT IF EXISTS fk_receipt_user,
            ADD CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        // 10. Create table symbols if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS symbols (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                image_url TEXT NOT NULL,
                is_available BOOLEAN DEFAULT TRUE
            )
        `);

        // 11. Create table election_officers if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS election_officers (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(100) NOT NULL,
                jurisdiction_level VARCHAR(50) NOT NULL CHECK (jurisdiction_level IN ('NATIONAL', 'STATE', 'DISTRICT', 'CONSTITUENCY')),
                state VARCHAR(100),
                district VARCHAR(100),
                constituency_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL
            )
        `);

        // 12. Create table grievances if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS grievances (
                id BIGSERIAL PRIMARY KEY,
                complainant_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                constituency_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL,
                status VARCHAR(20) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ASSIGNED', 'INVESTIGATION', 'REVIEW', 'RESOLVED')),
                assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
                resolution TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 13. Create table compliance_violations if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS compliance_violations (
                id BIGSERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                reporter_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
                status VARCHAR(20) DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED')),
                suspect VARCHAR(255),
                investigation_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 14. Create table incidents if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS incidents (
                id BIGSERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                severity VARCHAR(20) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                status VARCHAR(20) DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'ASSIGNED', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
                assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
                resolution TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 15. Create table version_history if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS version_history (
                id BIGSERIAL PRIMARY KEY,
                table_name VARCHAR(100) NOT NULL,
                record_id BIGINT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reason TEXT
            )
        `);

        // 16. Create table repolls if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS repolls (
                id BIGSERIAL PRIMARY KEY,
                election_id BIGINT REFERENCES elections(id) ON DELETE CASCADE,
                constituency_id BIGINT REFERENCES constituencies(id) ON DELETE CASCADE,
                polling_station_id BIGINT REFERENCES polling_stations(id) ON DELETE CASCADE,
                reason TEXT NOT NULL,
                scheduled_date TIMESTAMP NOT NULL,
                status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 17. Create table election_phases if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS election_phases (
                id BIGSERIAL PRIMARY KEY,
                election_id BIGINT REFERENCES elections(id) ON DELETE CASCADE,
                phase_number INTEGER NOT NULL,
                polling_date TIMESTAMP NOT NULL,
                status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED', 'SUSPENDED')),
                constituencies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ========================================================
        // OFFICIAL REFERENCE DATA TABLES
        // ========================================================

        // 18. Create table states
        await client.query(`
            CREATE TABLE IF NOT EXISTS states (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                code VARCHAR(50) NOT NULL UNIQUE,
                type VARCHAR(50) DEFAULT 'STATE',
                status VARCHAR(20) DEFAULT 'ACTIVE',
                data_source VARCHAR(255) DEFAULT 'Election Commission of India',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 19. Create table districts
        await client.query(`
            CREATE TABLE IF NOT EXISTS districts (
                id BIGSERIAL PRIMARY KEY,
                state_id BIGINT REFERENCES states(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                data_source VARCHAR(255) DEFAULT 'Election Commission of India',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 20. Create table parliamentary_constituencies
        await client.query(`
            CREATE TABLE IF NOT EXISTS parliamentary_constituencies (
                id BIGSERIAL PRIMARY KEY,
                state_id BIGINT REFERENCES states(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                constituency_number INTEGER NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                data_source VARCHAR(255) DEFAULT 'Election Commission of India',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 21. Create table assembly_constituencies
        await client.query(`
            CREATE TABLE IF NOT EXISTS assembly_constituencies (
                id BIGSERIAL PRIMARY KEY,
                state_id BIGINT REFERENCES states(id) ON DELETE CASCADE,
                district_id BIGINT REFERENCES districts(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                constituency_number INTEGER NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                data_source VARCHAR(255) DEFAULT 'Election Commission of India',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 22. Create table reference_parties
        await client.query(`
            CREATE TABLE IF NOT EXISTS reference_parties (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                abbreviation VARCHAR(50) NOT NULL UNIQUE,
                party_type VARCHAR(100) DEFAULT 'REGISTERED',
                state VARCHAR(100),
                symbol_name VARCHAR(255),
                status VARCHAR(20) DEFAULT 'ACTIVE',
                data_source VARCHAR(255) DEFAULT 'Election Commission of India',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 23. Create table election_symbols
        await client.query(`
            CREATE TABLE IF NOT EXISTS election_symbols (
                id BIGSERIAL PRIMARY KEY,
                symbol_name VARCHAR(255) NOT NULL UNIQUE,
                symbol_code VARCHAR(50) NOT NULL UNIQUE,
                image_path TEXT,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                data_source VARCHAR(255) DEFAULT 'Election Commission of India',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 24. Create table reference_elections
        await client.query(`
            CREATE TABLE IF NOT EXISTS reference_elections (
                id BIGSERIAL PRIMARY KEY,
                election_type VARCHAR(100) NOT NULL,
                election_name VARCHAR(255) NOT NULL,
                year INTEGER NOT NULL,
                state VARCHAR(100),
                election_date DATE,
                status VARCHAR(50) DEFAULT 'COMPLETED',
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 25. Create table reference_election_statistics
        await client.query(`
            CREATE TABLE IF NOT EXISTS reference_election_statistics (
                id BIGSERIAL PRIMARY KEY,
                election_id BIGINT REFERENCES reference_elections(id) ON DELETE CASCADE,
                total_electors BIGINT DEFAULT 0,
                male_electors BIGINT DEFAULT 0,
                female_electors BIGINT DEFAULT 0,
                third_gender_electors BIGINT DEFAULT 0,
                votes_polled BIGINT DEFAULT 0,
                turnout_percentage NUMERIC(5,2) DEFAULT 0.00,
                polling_stations INTEGER DEFAULT 0,
                candidates_count INTEGER DEFAULT 0,
                source_url TEXT,
                source_date DATE,
                last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_status VARCHAR(50) DEFAULT 'OFFICIAL_REFERENCE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed initial States & UTs reference data if empty
        const statesCheck = await client.query("SELECT COUNT(*) FROM states");
        if (parseInt(statesCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding states reference registry...");
            const defaultStates = [
                ['Maharashtra', 'MH', 'STATE', 'ACTIVE', 'Election Commission of India', 'https://eci.gov.in', '2026-08-14', 'OFFICIAL_REFERENCE'],
                ['Delhi', 'DL', 'UT', 'ACTIVE', 'Election Commission of India', 'https://eci.gov.in', '2026-08-14', 'OFFICIAL_REFERENCE'],
                ['Karnataka', 'KA', 'STATE', 'ACTIVE', 'Election Commission of India', 'https://eci.gov.in', '2026-08-14', 'OFFICIAL_REFERENCE'],
                ['Uttar Pradesh', 'UP', 'STATE', 'ACTIVE', 'Election Commission of India', 'https://eci.gov.in', '2026-08-14', 'OFFICIAL_REFERENCE']
            ];
            for (const s of defaultStates) {
                await client.query(`
                    INSERT INTO states (name, code, type, status, data_source, source_url, source_date, data_status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, s);
            }
        }

        // Seed initial Districts reference data if empty
        const districtsCheck = await client.query("SELECT COUNT(*) FROM districts");
        if (parseInt(districtsCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding districts reference registry...");
            // Load state IDs
            const mhRes = await client.query("SELECT id FROM states WHERE code = 'MH'");
            const dlRes = await client.query("SELECT id FROM states WHERE code = 'DL'");
            const kaRes = await client.query("SELECT id FROM states WHERE code = 'KA'");
            
            if (mhRes.rows.length > 0) {
                await client.query("INSERT INTO districts (state_id, name, code, status) VALUES ($1, 'Mumbai City', 'MUM', 'ACTIVE')", [mhRes.rows[0].id]);
                await client.query("INSERT INTO districts (state_id, name, code, status) VALUES ($1, 'Pune', 'PUN', 'ACTIVE')", [mhRes.rows[0].id]);
            }
            if (dlRes.rows.length > 0) {
                await client.query("INSERT INTO districts (state_id, name, code, status) VALUES ($1, 'New Delhi', 'NDL', 'ACTIVE')", [dlRes.rows[0].id]);
            }
            if (kaRes.rows.length > 0) {
                await client.query("INSERT INTO districts (state_id, name, code, status) VALUES ($1, 'Bengaluru Urban', 'BLR', 'ACTIVE')", [kaRes.rows[0].id]);
            }
        }

        // Seed initial Parliamentary Constituencies reference data if empty
        const pcCheck = await client.query("SELECT COUNT(*) FROM parliamentary_constituencies");
        if (parseInt(pcCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding parliamentary constituencies reference registry...");
            const mhRes = await client.query("SELECT id FROM states WHERE code = 'MH'");
            const dlRes = await client.query("SELECT id FROM states WHERE code = 'DL'");
            
            if (mhRes.rows.length > 0) {
                await client.query("INSERT INTO parliamentary_constituencies (state_id, name, constituency_number, code) VALUES ($1, 'Mumbai South', 31, 'MUMS_PC')", [mhRes.rows[0].id]);
                await client.query("INSERT INTO parliamentary_constituencies (state_id, name, constituency_number, code) VALUES ($1, 'Mumbai North', 29, 'MUMN_PC')", [mhRes.rows[0].id]);
            }
            if (dlRes.rows.length > 0) {
                await client.query("INSERT INTO parliamentary_constituencies (state_id, name, constituency_number, code) VALUES ($1, 'New Delhi PC', 4, 'NDL_PC')", [dlRes.rows[0].id]);
            }
        }

        // Seed initial Assembly Constituencies reference data if empty
        const acCheck = await client.query("SELECT COUNT(*) FROM assembly_constituencies");
        if (parseInt(acCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding assembly constituencies reference registry...");
            const mhRes = await client.query("SELECT id FROM states WHERE code = 'MH'");
            const mumRes = await client.query("SELECT id FROM districts WHERE code = 'MUM'");
            
            if (mhRes.rows.length > 0 && mumRes.rows.length > 0) {
                await client.query("INSERT INTO assembly_constituencies (state_id, district_id, name, constituency_number, code) VALUES ($1, $2, 'Colaba', 187, 'COL_AC')", [mhRes.rows[0].id, mumRes.rows[0].id]);
                await client.query("INSERT INTO assembly_constituencies (state_id, district_id, name, constituency_number, code) VALUES ($1, $2, 'Malabar Hill', 185, 'MAL_AC')", [mhRes.rows[0].id, mumRes.rows[0].id]);
            }
        }

        // Seed initial Reference Parties reference data if empty
        const refPartiesCheck = await client.query("SELECT COUNT(*) FROM reference_parties");
        if (parseInt(refPartiesCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding political parties reference registry...");
            const defaultParties = [
                ['Bharatiya Janata Party', 'BJP', 'NATIONAL', 'Lotus', 'ACTIVE'],
                ['Indian National Congress', 'INC', 'NATIONAL', 'Hand', 'ACTIVE'],
                ['Aam Aadmi Party', 'AAP', 'NATIONAL', 'Broom', 'ACTIVE'],
                ['Nationalist Congress Party', 'NCP', 'STATE', 'Clock', 'ACTIVE']
            ];
            for (const p of defaultParties) {
                await client.query(`
                    INSERT INTO reference_parties (name, abbreviation, party_type, symbol_name, status)
                    VALUES ($1, $2, $3, $4, $5)
                `, p);
            }
        }

        // Seed initial Election Symbols reference data if empty
        const refSymbolsCheck = await client.query("SELECT COUNT(*) FROM election_symbols");
        if (parseInt(refSymbolsCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding election symbols reference registry...");
            const defaultSymbols = [
                ['Lotus', 'SYM_LOTUS', 'Lotus flower symbol'],
                ['Hand', 'SYM_HAND', 'Hand symbol'],
                ['Broom', 'SYM_BROOM', 'Broom symbol'],
                ['Clock', 'SYM_CLOCK', 'Clock symbol']
            ];
            for (const s of defaultSymbols) {
                await client.query(`
                    INSERT INTO election_symbols (symbol_name, symbol_code, image_path)
                    VALUES ($1, $2, $3)
                `, s);
            }
        }

        // Seed initial Reference Elections reference data if empty
        const refElectionsCheck = await client.query("SELECT COUNT(*) FROM reference_elections");
        if (parseInt(refElectionsCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding historical elections reference registry...");
            const res = await client.query(`
                INSERT INTO reference_elections (election_type, election_name, year, state, election_date, status)
                VALUES ('Lok Sabha', 'General Parliamentary Election 2024', 2024, 'All India', '2024-05-20', 'COMPLETED')
                RETURNING id
            `);
            if (res.rows.length > 0) {
                await client.query(`
                    INSERT INTO reference_election_statistics (election_id, total_electors, male_electors, female_electors, votes_polled, turnout_percentage, polling_stations, candidates_count)
                    VALUES ($1, 968000000, 497000000, 471000000, 642000000, 66.33, 1050000, 8360)
                `, [res.rows[0].id]);
            }
        }

        // Seed default symbols if empty
        const symbolCheck = await client.query("SELECT COUNT(*) FROM symbols");
        if (parseInt(symbolCheck.rows[0].count) === 0) {
            console.log("[Migration] Seeding symbol registry...");
            const defaultSymbols = [
                ['Lotus', 'Lotus flower symbol'],
                ['Hand', 'Indian National Congress hand symbol'],
                ['Broom', 'Aam Aadmi Party broom symbol'],
                ['Bicycle', 'Bicycle icon symbol'],
                ['Elephant', 'Elephant icon symbol'],
                ['Scale', 'Scale of justice icon symbol'],
                ['Lion', 'Lion icon symbol'],
                ['Hammer and Sickle', 'Hammer and sickle symbol']
            ];
            for (const sym of defaultSymbols) {
                await client.query("INSERT INTO symbols (name, image_url, is_available) VALUES ($1, $2, TRUE)", sym);
            }
        }

        const adminCheck = await client.query("SELECT * FROM users WHERE email = $1", ["eci@gmail.com"]);
        if (adminCheck.rows.length === 0) {
            console.log("[Migration] Seeding ECI Admin user...");
            const bcrypt = require("bcrypt");
            const adminHash = await bcrypt.hash("GovOfIndia", 10);
            await client.query(
                `INSERT INTO users (name, email, password_hash, role, is_verified, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                ["ECI Admin", "eci@gmail.com", adminHash, "ADMIN", true, true]
            );
        }

        // 35. Phone Verifications Table for Voter Mobile OTP Authentication
        await client.query(`
            CREATE TABLE IF NOT EXISTS phone_verifications (
                id BIGSERIAL PRIMARY KEY,
                phone VARCHAR(20) NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                aadhaar_number VARCHAR(12),
                attempts INTEGER DEFAULT 0,
                is_verified BOOLEAN DEFAULT FALSE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`ALTER TABLE phone_verifications ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(12)`);

        // 36. UIDAI Aadhaar Master Identity Registry (Simulated Civic Master Database)
        await client.query(`
            CREATE TABLE IF NOT EXISTS uidai_aadhaar_registry (
                id BIGSERIAL PRIMARY KEY,
                aadhaar_number VARCHAR(12) NOT NULL UNIQUE,
                linked_phone VARCHAR(10) NOT NULL,
                full_name VARCHAR(150),
                dob DATE,
                gender VARCHAR(20),
                pincode VARCHAR(10),
                state_name VARCHAR(100),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed UIDAI Aadhaar Registry with demo records if empty
        const uidaiCount = await client.query("SELECT COUNT(*) FROM uidai_aadhaar_registry");
        if (parseInt(uidaiCount.rows[0].count, 10) === 0) {
            console.log("[Migration] Seeding UIDAI Aadhaar Master Registry with verified records...");
            await client.query(`
                INSERT INTO uidai_aadhaar_registry (aadhaar_number, linked_phone, full_name, dob, gender, pincode, state_name)
                VALUES 
                    ('999988887777', '9876543210', 'Bhupendra Dewangan', '1995-05-15', 'Male', '492001', 'Chhattisgarh'),
                    ('888877776666', '9123456780', 'Aarav Sharma', '1998-08-22', 'Male', '110001', 'Delhi'),
                    ('777766665555', '9988776655', 'Priya Patel', '2001-03-10', 'Female', '380001', 'Gujarat'),
                    ('666655554444', '9871234560', 'Vikramaditya Rao', '1990-11-28', 'Male', '560001', 'Karnataka')
                ON CONFLICT (aadhaar_number) DO NOTHING
            `);
        }

        // Add Biometric Verification columns to users table
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_verified BOOLEAN DEFAULT FALSE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS live_photo TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN DEFAULT FALSE`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS liveness_score FLOAT DEFAULT 0`);

        // Scalability Performance Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON phone_verifications(expires_at)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_uidai_aadhaar ON uidai_aadhaar_registry(aadhaar_number)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_uidai_phone ON uidai_aadhaar_registry(linked_phone)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_voter_id ON users(voter_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_aadhaar ON users(aadhaar_number)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_constituency ON users(constituency_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_polling_station ON users(polling_station_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_candidates_election_id ON candidates(election_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_voter_auth_user_election ON voter_election_authorizations(user_id, election_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_acs_state_district ON assembly_constituencies(state_id, district_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_acs_district ON assembly_constituencies(district_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ps_ac ON polling_stations(assembly_constituency_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ps_constituency ON polling_stations(constituency_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ps_district ON polling_stations(district_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ps_state ON polling_stations(state_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_uidai_aadhaar ON uidai_aadhaar_registry(aadhaar_number)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_uidai_phone ON uidai_aadhaar_registry(linked_phone)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_pv_aadhaar ON phone_verifications(aadhaar_number)`);

        // 36. Tamper-proof Immutability Trigger on audit_logs
        await client.query(`
            CREATE OR REPLACE FUNCTION trg_audit_log_immutable()
            RETURNS TRIGGER AS $$
            BEGIN
                RAISE EXCEPTION 'TAMPER-PROOF AUDIT LOG: Direct UPDATE and DELETE operations are permanently prohibited on audit_logs. All records are immutable legal audit trails.';
            END;
            $$ LANGUAGE plpgsql;
        `);
        await client.query(`
            DROP TRIGGER IF EXISTS audit_log_immutability_trigger ON audit_logs;
            CREATE TRIGGER audit_log_immutability_trigger
            BEFORE UPDATE OR DELETE ON audit_logs
            FOR EACH ROW
            EXECUTE FUNCTION trg_audit_log_immutable();
        `);

        await client.query("COMMIT");
        console.log("[Migration] Database schema migrations completed successfully!");

        // 37. Synchronize Complete National Master Electoral Geography (States, Districts, ACs, Polling Stations)
        try {
            const { seedAllIndiaMasterGeography } = require("../scripts/seed-all-india-electoral-data");
            await seedAllIndiaMasterGeography();
        } catch (geoErr) {
            console.error("[Migration] Non-fatal electoral geography sync notice:", geoErr.message);
        }
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("[Migration] Fatal migration crash. Rolled back changes. Error:", err);
    } finally {
        client.release();
    }
}

module.exports = { runMigrations };
