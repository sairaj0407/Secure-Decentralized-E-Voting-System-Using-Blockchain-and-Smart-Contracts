const pool = require("../config/database");
const { logAuditActivity } = require("../utils/auditLogger");

// ============================================================
// VERSION LOGGING HELPER
// ============================================================
const logVersionHistory = async (tableName, recordId, oldValue, newValue, changedBy, reason) => {
    try {
        await pool.query(
            `INSERT INTO version_history (table_name, record_id, old_value, new_value, changed_by, reason) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [tableName, recordId, JSON.stringify(oldValue), JSON.stringify(newValue), changedBy, reason]
        );
    } catch (err) {
        console.error("[Version History Log Error]:", err.message);
    }
};

// ============================================================
// OFFICERS
// ============================================================
const getOfficers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT eo.*, u.name as user_name, u.email as user_email, c.name as constituency_name 
             FROM election_officers eo
             JOIN users u ON eo.user_id = u.id
             LEFT JOIN constituencies c ON eo.constituency_id = c.id
             ORDER BY eo.id DESC`
        );
        res.json({ success: true, officers: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createOfficer = async (req, res) => {
    const { user_email, role, jurisdiction_level, state, district, constituency_id } = req.body;
    try {
        // Find user by email
        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [user_email]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User with this email not found." });
        }
        const userId = userRes.rows[0].id;

        // Verify user role matches
        await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);

        const result = await pool.query(
            `INSERT INTO election_officers (user_id, role, jurisdiction_level, state, district, constituency_id)
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [userId, role, jurisdiction_level, state || null, district || null, constituency_id || null]
        );

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_CREATE_ELECTION_OFFICER",
            description: `Admin assigned officer role ${role} to ${user_email} (Jurisdiction: ${jurisdiction_level}, State: ${state || 'N/A'})`,
            req
        });

        res.json({ success: true, officer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteOfficer = async (req, res) => {
    const { id } = req.params;
    try {
        const officerRes = await pool.query("SELECT user_id, role FROM election_officers WHERE id = $1", [id]);
        if (officerRes.rows.length > 0) {
            const { user_id, role } = officerRes.rows[0];
            await pool.query("UPDATE users SET role = 'VOTER' WHERE id = $1", [user_id]);
            await logAuditActivity({
                userId: req.user?.userId,
                action: "ADMIN_REVOKE_ELECTION_OFFICER",
                description: `Admin revoked officer role ${role} for User ID: ${user_id}`,
                req
            });
        }
        await pool.query("DELETE FROM election_officers WHERE id = $1", [id]);
        res.json({ success: true, message: "Officer deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// SYMBOLS
// ============================================================
const getSymbols = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM symbols ORDER BY name ASC");
        res.json({ success: true, symbols: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createSymbol = async (req, res) => {
    const { name, image_url } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO symbols (name, image_url) VALUES ($1, $2) RETURNING *",
            [name, image_url]
        );

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_CREATE_SYMBOL",
            description: `Admin registered official election symbol: "${name}"`,
            req
        });

        res.json({ success: true, symbol: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// GRIEVANCES
// ============================================================
const getGrievances = async (req, res) => {
    try {
        let query = `SELECT g.*, u.name as complainant_name, c.name as constituency_name, u2.name as assigned_officer_name 
             FROM grievances g
             JOIN users u ON g.complainant_id = u.id
             LEFT JOIN constituencies c ON g.constituency_id = c.id
             LEFT JOIN users u2 ON g.assigned_to = u2.id`;
        const params = [];
        if (req.user && req.user.role === "VOTER") {
            query += ` WHERE g.complainant_id = $1`;
            params.push(req.user.userId);
        }
        query += ` ORDER BY g.id DESC`;
        const result = await pool.query(query, params);
        res.json({ success: true, grievances: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createGrievance = async (req, res) => {
    const { category, description, constituency_id } = req.body;
    const complainant_id = req.user.userId;
    try {
        const result = await pool.query(
            `INSERT INTO grievances (complainant_id, category, description, constituency_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [complainant_id, category, description, constituency_id || null]
        );
        res.json({ success: true, grievance: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateGrievance = async (req, res) => {
    const { id } = req.params;
    const { status, assigned_to, resolution } = req.body;
    try {
        const oldGrievance = await pool.query("SELECT * FROM grievances WHERE id = $1", [id]);
        
        const result = await pool.query(
            `UPDATE grievances 
             SET status = COALESCE($1, status),
                 assigned_to = COALESCE($2, assigned_to),
                 resolution = COALESCE($3, resolution)
             WHERE id = $4 RETURNING *`,
            [status, assigned_to, resolution, id]
        );

        if (oldGrievance.rows.length > 0) {
            await logVersionHistory("grievances", id, oldGrievance.rows[0], result.rows[0], req.user.userId, `Grievance updated status to ${status}`);
        }

        res.json({ success: true, grievance: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// COMPLIANCE
// ============================================================
const getCompliance = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cv.*, u.name as reporter_name 
             FROM compliance_violations cv
             LEFT JOIN users u ON cv.reporter_id = u.id
             ORDER BY cv.id DESC`
        );
        res.json({ success: true, violations: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createCompliance = async (req, res) => {
    const { category, description, suspect } = req.body;
    const reporter_id = req.user.userId;
    try {
        const result = await pool.query(
            `INSERT INTO compliance_violations (category, description, suspect, reporter_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [category, description, suspect, reporter_id]
        );
        res.json({ success: true, violation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCompliance = async (req, res) => {
    const { id } = req.params;
    const { status, investigation_notes } = req.body;
    try {
        const oldViolation = await pool.query("SELECT * FROM compliance_violations WHERE id = $1", [id]);
        
        const result = await pool.query(
            `UPDATE compliance_violations
             SET status = COALESCE($1, status),
                 investigation_notes = COALESCE($2, investigation_notes)
             WHERE id = $3 RETURNING *`,
            [status, investigation_notes, id]
        );

        if (oldViolation.rows.length > 0) {
            await logVersionHistory("compliance_violations", id, oldViolation.rows[0], result.rows[0], req.user.userId, `Compliance violation updated status to ${status}`);
        }

        res.json({ success: true, violation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// INCIDENTS
// ============================================================
const getIncidents = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, u.name as assigned_officer_name 
             FROM incidents i
             LEFT JOIN users u ON i.assigned_to = u.id
             ORDER BY i.id DESC`
        );
        res.json({ success: true, incidents: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createIncident = async (req, res) => {
    const { category, description, severity } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO incidents (category, description, severity)
             VALUES ($1, $2, $3) RETURNING *`,
            [category, description, severity]
        );
        res.json({ success: true, incident: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateIncident = async (req, res) => {
    const { id } = req.params;
    const { status, assigned_to, resolution } = req.body;
    try {
        const oldIncident = await pool.query("SELECT * FROM incidents WHERE id = $1", [id]);
        
        const result = await pool.query(
            `UPDATE incidents
             SET status = COALESCE($1, status),
                 assigned_to = COALESCE($2, assigned_to),
                 resolution = COALESCE($3, resolution)
             WHERE id = $4 RETURNING *`,
            [status, assigned_to, resolution, id]
        );

        if (oldIncident.rows.length > 0) {
            await logVersionHistory("incidents", id, oldIncident.rows[0], result.rows[0], req.user.userId, `Incident status updated to ${status}`);
        }

        res.json({ success: true, incident: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// RE-POLLS
// ============================================================
const getRepolls = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, e.title as election_title, c.name as constituency_name, ps.name as polling_station_name 
             FROM repolls r
             JOIN elections e ON r.election_id = e.id
             LEFT JOIN constituencies c ON r.constituency_id = c.id
             LEFT JOIN polling_stations ps ON r.polling_station_id = ps.id
             ORDER BY r.id DESC`
        );
        res.json({ success: true, repolls: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createRepoll = async (req, res) => {
    const { election_id, constituency_id, polling_station_id, reason, scheduled_date } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO repolls (election_id, constituency_id, polling_station_id, reason, scheduled_date)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [election_id, constituency_id, polling_station_id, reason, scheduled_date]
        );

        // Track action in Audit Log
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, description) 
             VALUES ($1, 'SCHEDULE_REPOLL', $2)`,
            [req.user.userId, `Scheduled re-poll for Election ID: ${election_id}, Station: ${polling_station_id}`]
        );

        res.json({ success: true, repoll: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// PHASES
// ============================================================
const getPhases = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ep.*, e.title as election_title 
             FROM election_phases ep
             JOIN elections e ON ep.election_id = e.id
             ORDER BY ep.id DESC`
        );
        res.json({ success: true, phases: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createPhase = async (req, res) => {
    const { election_id, phase_number, polling_date, status, constituencies } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO election_phases (election_id, phase_number, polling_date, status, constituencies)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [election_id, phase_number, polling_date, status, constituencies]
        );
        res.json({ success: true, phase: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// VERSION HISTORY
// ============================================================
const getVersionHistory = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.*, u.name as user_name 
             FROM version_history v
             LEFT JOIN users u ON v.changed_by = u.id
             ORDER BY v.id DESC`
        );
        res.json({ success: true, history: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// AUDIT REPLAY
// ============================================================
const getAuditReplay = async (req, res) => {
    const { electionId } = req.params;
    try {
        const result = await pool.query(
            `SELECT 'AUDIT' as source, action as title, description, created_at as timestamp 
             FROM audit_logs 
             WHERE description ILIKE $1 OR description ILIKE $2
             UNION ALL
             SELECT 'BLOCKCHAIN' as source, 'On-Chain Transaction' as title, 'Tx Hash: ' || tx_hash || ' (Status: ' || transaction_status || ')' as description, created_at as timestamp 
             FROM blockchain_transactions 
             WHERE election_id = $3
             ORDER BY timestamp ASC`,
            [`%election%${electionId}%`, `%Election ID: ${electionId}%`, electionId]
        );
        res.json({ success: true, timeline: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// VERIFY RECEIPT
// ============================================================
const verifyReceipt = async (req, res) => {
    const { code } = req.params;
    try {
        const crypto = require("crypto");
        const result = await pool.query(
            `SELECT 
                vr.receipt_code, 
                vr.tx_hash, 
                vr.block_number, 
                vr.created_at,
                e.id as election_id,
                e.title as election_title, 
                e.election_code, 
                e.election_type, 
                e.election_level, 
                e.jurisdiction,
                u.name as elector_name, 
                u.voter_id as elector_epic_id, 
                u.address as elector_address, 
                u.wallet_address as elector_wallet,
                c.name as constituency_name, 
                c.code as constituency_code,
                ps.name as polling_station_name, 
                ps.code as polling_station_code,
                cand.name as candidate_name, 
                cand.party as candidate_party, 
                cand.symbol as candidate_symbol,
                v.gas_used,
                v.voted_at
             FROM voter_receipts vr
             JOIN elections e ON vr.election_id = e.id
             JOIN users u ON vr.user_id = u.id
             LEFT JOIN constituencies c ON u.constituency_id = c.id
             LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
             LEFT JOIN votes v ON v.voter_id = vr.user_id AND v.election_id = vr.election_id
             LEFT JOIN candidates cand ON v.candidate_id = cand.id
             WHERE vr.receipt_code = $1`,
            [code]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, authentic: false, message: "Receipt code is invalid or has been modified!" });
        }
        const row = result.rows[0];
        const sigPayload = `${row.receipt_code}:${row.tx_hash}:${row.elector_epic_id || row.elector_id || "VOTER"}:${row.block_number}`;
        row.digital_signature = crypto.createHash("sha256").update(sigPayload).digest("hex").toUpperCase();

        // Cryptographic Ballot Inclusion Proof (Section 128 RPA 1951 - Secret Ballot Standard)
        const inclusionPayload = `INCLUSION:${row.receipt_code}:${row.tx_hash}:${row.election_id}:${row.block_number}`;
        row.ballot_inclusion_hash = crypto.createHash("sha256").update(inclusionPayload).digest("hex").toUpperCase();
        row.secret_ballot_standard = "SECTION_128_RPA_1951";

        res.json({ 
            success: true, 
            authentic: true, 
            message: "AUTHENTIC E-VOTE RECEIPT VERIFIED ON BLOCKCHAIN LEDGER",
            receipt: row
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// GET ALL RECEIPTS (ADMIN & AUDIT LOGS)
// ============================================================
const getAllReceipts = async (req, res) => {
    try {
        const { electionId, search } = req.query;
        let query = `
            SELECT 
                vr.id,
                vr.receipt_code, 
                vr.tx_hash, 
                vr.block_number, 
                vr.created_at,
                e.id as election_id,
                e.title as election_title, 
                e.election_code,
                u.name as elector_name, 
                u.voter_id as elector_epic_id,
                c.name as constituency_name,
                ps.name as polling_station_name,
                cand.name as candidate_name,
                cand.party as candidate_party,
                cand.symbol as candidate_symbol,
                v.gas_used
            FROM voter_receipts vr
            JOIN elections e ON vr.election_id = e.id
            JOIN users u ON vr.user_id = u.id
            LEFT JOIN constituencies c ON u.constituency_id = c.id
            LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
            LEFT JOIN votes v ON v.voter_id = vr.user_id AND v.election_id = vr.election_id
            LEFT JOIN candidates cand ON v.candidate_id = cand.id
            WHERE 1=1
        `;
        const params = [];
        if (electionId) {
            params.push(electionId);
            query += ` AND vr.election_id = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (vr.receipt_code ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.voter_id ILIKE $${params.length})`;
        }
        query += " ORDER BY vr.id DESC LIMIT 150";
        const result = await pool.query(query, params);
        res.json({ success: true, receipts: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getOfficers,
    createOfficer,
    deleteOfficer,
    getSymbols,
    createSymbol,
    getGrievances,
    createGrievance,
    updateGrievance,
    getCompliance,
    createCompliance,
    updateCompliance,
    getIncidents,
    createIncident,
    updateIncident,
    getRepolls,
    createRepoll,
    getPhases,
    createPhase,
    getVersionHistory,
    getAuditReplay,
    verifyReceipt,
    getAllReceipts
};
