const pool = require("../config/database");
const { logAuditActivity } = require("../utils/auditLogger");

// Helper to parse CSV manually
function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ""));
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple split but respecting commas in quotes
        let values = [];
        let current = '';
        let inQuotes = false;
        
        for (let char of line) {
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^["']|["']$/g, ""));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/^["']|["']$/g, ""));
        
        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index] !== undefined ? values[index] : "";
        });
        records.push(record);
    }
    return records;
}

// --------------------------------------------------------
// IN-MEMORY HIGH-PERFORMANCE GEOGRAPHY CACHE
// Eliminates repetitive PostgreSQL disk I/O, providing O(1) response times (<0.5ms)
// --------------------------------------------------------
const refDataCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getCached(key) {
    const entry = refDataCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        refDataCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCached(key, data) {
    refDataCache.set(key, {
        data,
        expiry: Date.now() + CACHE_TTL_MS
    });
}

function clearRefDataCache() {
    refDataCache.clear();
}
exports.clearRefDataCache = clearRefDataCache;

// --------------------------------------------------------
// RETRIEVAL ENDPOINTS
// --------------------------------------------------------

exports.getStates = async (req, res) => {
    try {
        const { search, status, sort } = req.query;
        const cacheKey = `states:${search || ""}:${status || ""}:${sort || ""}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        let query = "SELECT * FROM states WHERE 1=1";
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length})`;
        }
        if (status && status !== "ALL") {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        
        if (sort === "name_desc") query += " ORDER BY name DESC";
        else if (sort === "code") query += " ORDER BY code ASC";
        else query += " ORDER BY name ASC";
        
        const result = await pool.query(query, params);
        const payload = { success: true, states: result.rows };
        setCached(cacheKey, payload);
        res.json(payload);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDistricts = async (req, res) => {
    try {
        const { search, state_id, sort } = req.query;
        const cacheKey = `districts:${search || ""}:${state_id || ""}:${sort || ""}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        let query = `
            SELECT d.*, s.name as state_name 
            FROM districts d
            LEFT JOIN states s ON d.state_id = s.id
            WHERE 1=1
        `;
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (d.name ILIKE $${params.length} OR d.code ILIKE $${params.length})`;
        }
        if (state_id) {
            params.push(state_id);
            query += ` AND d.state_id = $${params.length}`;
        }
        
        if (sort === "name_desc") query += " ORDER BY d.name DESC";
        else query += " ORDER BY d.name ASC";
        
        const result = await pool.query(query, params);
        const payload = { success: true, districts: result.rows };
        setCached(cacheKey, payload);
        res.json(payload);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getParliamentaryConstituencies = async (req, res) => {
    try {
        const { search, state_id, sort } = req.query;
        const cacheKey = `pcs:${search || ""}:${state_id || ""}:${sort || ""}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        let query = `
            SELECT pc.*, s.name as state_name 
            FROM parliamentary_constituencies pc
            LEFT JOIN states s ON pc.state_id = s.id
            WHERE 1=1
        `;
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (pc.name ILIKE $${params.length} OR pc.code ILIKE $${params.length})`;
        }
        if (state_id) {
            params.push(state_id);
            query += ` AND pc.state_id = $${params.length}`;
        }
        
        if (sort === "number") query += " ORDER BY pc.constituency_number ASC";
        else query += " ORDER BY pc.name ASC";
        
        const result = await pool.query(query, params);
        const payload = { success: true, constituencies: result.rows, pcs: result.rows };
        setCached(cacheKey, payload);
        res.json(payload);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAssemblyConstituencies = async (req, res) => {
    try {
        const { search, state_id, district_id, sort } = req.query;
        const cacheKey = `acs:${search || ""}:${state_id || ""}:${district_id || ""}:${sort || ""}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        let query = `
            SELECT ac.*, s.name as state_name, d.name as district_name 
            FROM assembly_constituencies ac
            LEFT JOIN states s ON ac.state_id = s.id
            LEFT JOIN districts d ON ac.district_id = d.id
            WHERE 1=1
        `;
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (ac.name ILIKE $${params.length} OR ac.code ILIKE $${params.length})`;
        }
        if (state_id) {
            params.push(state_id);
            query += ` AND ac.state_id = $${params.length}`;
        }
        if (district_id) {
            params.push(district_id);
            query += ` AND ac.district_id = $${params.length}`;
        }
        
        if (sort === "number") query += " ORDER BY ac.constituency_number ASC";
        else query += " ORDER BY ac.name ASC";
        
        const result = await pool.query(query, params);
        const payload = { success: true, constituencies: result.rows, acs: result.rows };
        setCached(cacheKey, payload);
        res.json(payload);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReferenceParties = async (req, res) => {
    try {
        const { search, type, status } = req.query;
        let query = "SELECT * FROM reference_parties WHERE 1=1";
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (name ILIKE $${params.length} OR abbreviation ILIKE $${params.length})`;
        }
        if (type && type !== "ALL") {
            params.push(type);
            query += ` AND party_type = $${params.length}`;
        }
        if (status && status !== "ALL") {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        
        query += " ORDER BY name ASC";
        const result = await pool.query(query, params);
        res.json({ success: true, parties: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getElectionSymbols = async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM election_symbols WHERE 1=1";
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (symbol_name ILIKE $${params.length} OR symbol_code ILIKE $${params.length})`;
        }
        
        query += " ORDER BY symbol_name ASC";
        const result = await pool.query(query, params);
        res.json({ success: true, symbols: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReferenceElections = async (req, res) => {
    try {
        const { search, type } = req.query;
        let query = "SELECT * FROM reference_elections WHERE 1=1";
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND election_name ILIKE $${params.length}`;
        }
        if (type && type !== "ALL") {
            params.push(type);
            query += ` AND election_type = $${params.length}`;
        }
        
        query += " ORDER BY year DESC, election_date DESC";
        const result = await pool.query(query, params);
        res.json({ success: true, elections: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReferenceElectionStatistics = async (req, res) => {
    try {
        const { election_id } = req.params;
        const result = await pool.query(`
            SELECT s.*, e.election_name, e.year, e.state 
            FROM reference_election_statistics s
            LEFT JOIN reference_elections e ON s.election_id = e.id
            WHERE s.election_id = $1
        `, [election_id]);
        
        res.json({ success: true, statistics: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --------------------------------------------------------
// ADD / EDIT / ARCHIVE / VERIFY ENDPOINTS
// --------------------------------------------------------

exports.addState = async (req, res) => {
    try {
        const { name, code, type, data_source, source_url, source_date } = req.body;
        const result = await pool.query(`
            INSERT INTO states (name, code, type, data_source, source_url, source_date, data_status)
            VALUES ($1, $2, $3, $4, $5, $6, 'ADMIN_VERIFIED')
            RETURNING *
        `, [name, code, type || 'STATE', data_source || 'Admin Entered', source_url || null, source_date || null]);
        
        clearRefDataCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_ADD_STATE",
            description: `Admin created State/UT: "${name}" (${code})`,
            req
        });

        res.json({ success: true, state: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, type, status, data_source, source_url, source_date } = req.body;
        const result = await pool.query(`
            UPDATE states 
            SET name = $1, code = $2, type = $3, status = $4, data_source = $5, source_url = $6, source_date = $7, last_verified_at = NOW(), updated_at = NOW()
            WHERE id = $8
            RETURNING *
        `, [name, code, type, status, data_source, source_url, source_date, id]);
        
        clearRefDataCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_UPDATE_STATE",
            description: `Admin updated State/UT ID: ${id} to "${name}" (${code}), status: ${status}`,
            req
        });

        res.json({ success: true, state: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyState = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE states SET last_verified_at = NOW(), data_status = 'ADMIN_VERIFIED' WHERE id = $1", [id]);
        
        clearRefDataCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_VERIFY_STATE",
            description: `Admin verified official reference data for State/UT ID: ${id}`,
            req
        });

        res.json({ success: true, message: "State data verified successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.archiveState = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE states SET status = 'ARCHIVED', data_status = 'ARCHIVED' WHERE id = $1", [id]);
        
        clearRefDataCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_ARCHIVE_STATE",
            description: `Admin archived State/UT ID: ${id}`,
            req
        });

        res.json({ success: true, message: "State reference data archived." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- PARTY ENDPOINTS ---
exports.addParty = async (req, res) => {
    try {
        const { name, abbreviation, party_type, state, symbol_name, data_source, source_url, source_date } = req.body;
        const result = await pool.query(`
            INSERT INTO reference_parties (name, abbreviation, party_type, state, symbol_name, data_source, source_url, source_date, data_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ADMIN_VERIFIED')
            RETURNING *
        `, [name, abbreviation, party_type || 'REGISTERED', state || null, symbol_name || null, data_source || 'Admin Entered', source_url || null, source_date || null]);
        
        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_ADD_PARTY",
            description: `Admin registered political party: "${name}" (${abbreviation}), symbol: ${symbol_name || 'N/A'}`,
            req
        });

        res.json({ success: true, party: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateParty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, abbreviation, party_type, state, symbol_name, status, data_source, source_url, source_date } = req.body;
        const result = await pool.query(`
            UPDATE reference_parties 
            SET name = $1, abbreviation = $2, party_type = $3, state = $4, symbol_name = $5, status = $6, data_source = $7, source_url = $8, source_date = $9, last_verified_at = NOW(), updated_at = NOW()
            WHERE id = $10
            RETURNING *
        `, [name, abbreviation, party_type, state, symbol_name, status, data_source, source_url, source_date, id]);
        
        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_UPDATE_PARTY",
            description: `Admin updated political party ID: ${id} ("${name}", ${abbreviation}), status: ${status}`,
            req
        });

        res.json({ success: true, party: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyParty = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE reference_parties SET last_verified_at = NOW(), data_status = 'ADMIN_VERIFIED' WHERE id = $1", [id]);
        
        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_VERIFY_PARTY",
            description: `Admin verified political party ID: ${id}`,
            req
        });

        res.json({ success: true, message: "Party reference verified." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.archiveParty = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE reference_parties SET status = 'ARCHIVED', data_status = 'ARCHIVED' WHERE id = $1", [id]);
        
        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_ARCHIVE_PARTY",
            description: `Admin archived political party ID: ${id}`,
            req
        });

        res.json({ success: true, message: "Party reference archived." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --------------------------------------------------------
// DATA IMPORT WORKFLOW (CSV IMPORT)
// --------------------------------------------------------

exports.validateImport = async (req, res) => {
    try {
        const { tableType, csvText, data_source, source_url, source_date } = req.body;
        if (!csvText || !tableType) {
            return res.status(400).json({ success: false, message: "Missing csvText or tableType." });
        }
        
        const records = parseCSV(csvText);
        if (records.length === 0) {
            return res.status(400).json({ success: false, message: "CSV content is empty or headers are missing." });
        }
        
        const validationReport = {
            totalRecords: records.length,
            newRecords: 0,
            duplicateRecords: 0,
            invalidRecords: 0,
            missingFields: 0,
            errors: []
        };
        
        const validatedRecords = [];
        
        for (let i = 0; i < records.length; i++) {
            const rec = records[i];
            let isValid = true;
            let isDuplicate = false;
            
            // Basic required fields validations depending on tableType
            if (tableType === "states") {
                if (!rec.name || !rec.code) {
                    validationReport.missingFields++;
                    validationReport.errors.push(`Row ${i+1}: Missing required fields 'name' or 'code'`);
                    isValid = false;
                } else {
                    // Check duplicate in DB
                    const dup = await pool.query("SELECT id FROM states WHERE code = $1 OR name = $2", [rec.code, rec.name]);
                    if (dup.rows.length > 0) {
                        isDuplicate = true;
                        validationReport.duplicateRecords++;
                    }
                }
            } else if (tableType === "reference_parties") {
                if (!rec.name || !rec.abbreviation) {
                    validationReport.missingFields++;
                    validationReport.errors.push(`Row ${i+1}: Missing required fields 'name' or 'abbreviation'`);
                    isValid = false;
                } else {
                    const dup = await pool.query("SELECT id FROM reference_parties WHERE abbreviation = $1 OR name = $2", [rec.abbreviation, rec.name]);
                    if (dup.rows.length > 0) {
                        isDuplicate = true;
                        validationReport.duplicateRecords++;
                    }
                }
            } else if (tableType === "districts") {
                if (!rec.name || !rec.code || !rec.state_code) {
                    validationReport.missingFields++;
                    validationReport.errors.push(`Row ${i+1}: Missing required fields 'name', 'code', or 'state_code'`);
                    isValid = false;
                } else {
                    const dup = await pool.query("SELECT id FROM districts WHERE code = $1", [rec.code]);
                    if (dup.rows.length > 0) {
                        isDuplicate = true;
                        validationReport.duplicateRecords++;
                    }
                    // Validate state_code exists
                    const st = await pool.query("SELECT id FROM states WHERE code = $1", [rec.state_code]);
                    if (st.rows.length === 0) {
                        validationReport.errors.push(`Row ${i+1}: state_code '${rec.state_code}' does not exist in states table`);
                        isValid = false;
                    } else {
                        rec.state_id = st.rows[0].id;
                    }
                }
            } else if (tableType === "parliamentary_constituencies") {
                if (!rec.name || !rec.code || !rec.constituency_number || !rec.state_code) {
                    validationReport.missingFields++;
                    validationReport.errors.push(`Row ${i+1}: Missing required fields 'name', 'code', 'constituency_number', or 'state_code'`);
                    isValid = false;
                } else {
                    const dup = await pool.query("SELECT id FROM parliamentary_constituencies WHERE code = $1", [rec.code]);
                    if (dup.rows.length > 0) {
                        isDuplicate = true;
                        validationReport.duplicateRecords++;
                    }
                    const st = await pool.query("SELECT id FROM states WHERE code = $1", [rec.state_code]);
                    if (st.rows.length === 0) {
                        validationReport.errors.push(`Row ${i+1}: state_code '${rec.state_code}' does not exist in states table`);
                        isValid = false;
                    } else {
                        rec.state_id = st.rows[0].id;
                    }
                }
            }
            
            if (!isValid) {
                validationReport.invalidRecords++;
            } else if (!isDuplicate) {
                validationReport.newRecords++;
                // Add source info
                rec.data_source = data_source || "CSV Import";
                rec.source_url = source_url || null;
                rec.source_date = source_date || null;
                validatedRecords.push(rec);
            }
        }
        
        res.json({
            success: true,
            validationReport,
            previewRecords: validatedRecords
        });
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveImport = async (req, res) => {
    const client = await pool.connect();
    try {
        const { tableType, records } = req.body;
        if (!tableType || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: "Missing tableType or records array." });
        }
        
        await client.query("BEGIN");
        
        for (const rec of records) {
            if (tableType === "states") {
                await client.query(`
                    INSERT INTO states (name, code, type, status, data_source, source_url, source_date, data_status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 'IMPORTED')
                    ON CONFLICT (code) DO NOTHING
                `, [rec.name, rec.code, rec.type || 'STATE', 'ACTIVE', rec.data_source, rec.source_url, rec.source_date]);
            } else if (tableType === "reference_parties") {
                await client.query(`
                    INSERT INTO reference_parties (name, abbreviation, party_type, state, symbol_name, status, data_source, source_url, source_date, data_status)
                    VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, $7, $8, 'IMPORTED')
                    ON CONFLICT (abbreviation) DO NOTHING
                `, [rec.name, rec.abbreviation, rec.party_type || 'REGISTERED', rec.state || null, rec.symbol_name || null, rec.data_source, rec.source_url, rec.source_date]);
            } else if (tableType === "districts") {
                await client.query(`
                    INSERT INTO districts (state_id, name, code, status, data_source, source_url, source_date, data_status)
                    VALUES ($1, $2, $3, 'ACTIVE', $4, $5, $6, 'IMPORTED')
                    ON CONFLICT (code) DO NOTHING
                `, [rec.state_id, rec.name, rec.code, rec.data_source, rec.source_url, rec.source_date]);
            } else if (tableType === "parliamentary_constituencies") {
                await client.query(`
                    INSERT INTO parliamentary_constituencies (state_id, name, constituency_number, code, status, data_source, source_url, source_date, data_status)
                    VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, 'IMPORTED')
                    ON CONFLICT (code) DO NOTHING
                `, [rec.state_id, rec.name, parseInt(rec.constituency_number), rec.code, rec.data_source, rec.source_url, rec.source_date]);
            }
        }
        
        await client.query("COMMIT");
        clearRefDataCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_APPROVE_DATA_IMPORT",
            description: `Admin imported ${records.length} records into table "${tableType}"`,
            req
        });

        res.json({ success: true, message: `Successfully stored ${records.length} records into ${tableType}.` });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
};
