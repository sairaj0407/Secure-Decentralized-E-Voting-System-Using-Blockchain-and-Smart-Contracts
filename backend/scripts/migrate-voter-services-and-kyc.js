require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../config/database");

async function migrate() {
    try {
        console.log("Running database migrations for voter services and candidate KYC...");
        
        // 1. Add candidate KYC columns if not present
        await pool.query(`
            ALTER TABLE candidates 
            ADD COLUMN IF NOT EXISTS education VARCHAR(255),
            ADD COLUMN IF NOT EXISTS total_assets VARCHAR(100),
            ADD COLUMN IF NOT EXISTS total_liabilities VARCHAR(100),
            ADD COLUMN IF NOT EXISTS criminal_cases_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS affidavit_summary TEXT;
        `);
        console.log("Candidates table updated with KYC columns.");

        // 2. Create voter_service_requests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS voter_service_requests (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                request_type VARCHAR(50) NOT NULL,
                category VARCHAR(100) NOT NULL,
                details JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'SUBMITTED',
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("voter_service_requests table verified/created.");

        // 3. Ensure indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_voter_service_requests_user ON voter_service_requests(user_id);
            CREATE INDEX IF NOT EXISTS idx_voter_service_requests_status ON voter_service_requests(status);
        `);
        console.log("Indexes created successfully.");

        process.exit(0);
    } catch (e) {
        console.error("Migration error:", e);
        process.exit(1);
    }
}

migrate();
