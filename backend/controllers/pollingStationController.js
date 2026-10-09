const pool = require("../config/database");
const { logAuditActivity } = require("../utils/auditLogger");

// High-performance cache for designated polling booths
const pollingStationCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key) {
    const entry = pollingStationCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        pollingStationCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCached(key, data) {
    pollingStationCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

function clearPollingStationCache() {
    pollingStationCache.clear();
}

const getPollingStations = async (req, res) => {
    try {
        const { constituency_id, assembly_constituency_id, district_id, state_id, search } = req.query;
        const cacheKey = `ps:${constituency_id || ""}:${assembly_constituency_id || ""}:${district_id || ""}:${state_id || ""}:${search || ""}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        let query = `
            SELECT ps.*, 
                   COALESCE(ac.name, c.name) as constituency_name,
                   d.name as district_name,
                   s.name as state_name
            FROM polling_stations ps
            LEFT JOIN constituencies c ON ps.constituency_id = c.id
            LEFT JOIN assembly_constituencies ac ON ps.assembly_constituency_id = ac.id
            LEFT JOIN districts d ON COALESCE(ps.district_id, ac.district_id) = d.id
            LEFT JOIN states s ON COALESCE(ps.state_id, ac.state_id, d.state_id) = s.id
            WHERE 1=1
        `;
        const params = [];

        if (assembly_constituency_id) {
            params.push(parseInt(assembly_constituency_id));
            query += ` AND ps.assembly_constituency_id = $${params.length}`;
        } else if (constituency_id) {
            params.push(parseInt(constituency_id));
            query += ` AND (
                ps.constituency_id = $${params.length} 
                OR ps.constituency_id IN (SELECT id FROM constituencies WHERE parent_id = $${params.length})
            )`;
        }

        if (district_id) {
            params.push(parseInt(district_id));
            query += ` AND (ps.district_id = $${params.length} OR ac.district_id = $${params.length})`;
        }

        if (state_id) {
            params.push(parseInt(state_id));
            query += ` AND (ps.state_id = $${params.length} OR ac.state_id = $${params.length} OR d.state_id = $${params.length})`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (ps.name ILIKE $${params.length} OR ps.code ILIKE $${params.length} OR ps.address ILIKE $${params.length})`;
        }

        query += ` ORDER BY ps.id ASC`;

        const result = await pool.query(query, params);
        const payload = { 
            success: true, 
            pollingStations: result.rows,
            stations: result.rows 
        };
        setCached(cacheKey, payload);
        res.json(payload);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createPollingStation = async (req, res) => {
    const { name, code, address, constituency_id, capacity, assigned_officer_id } = req.body;
    if (!name || !code || !address || !constituency_id) {
        return res.status(400).json({ success: false, message: "Name, code, address, and constituency_id are required fields." });
    }
    try {
        const result = await pool.query(
            `INSERT INTO polling_stations (name, code, address, constituency_id, capacity, assigned_officer_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, code, address, constituency_id, capacity || 1000, assigned_officer_id || null]
        );

        clearPollingStationCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_CREATE_POLLING_STATION",
            description: `Admin created Polling Station: "${name}" (${code}) at "${address}"`,
            req
        });

        res.status(201).json({ success: true, pollingStation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const assignOfficer = async (req, res) => {
    const { id } = req.params;
    const { assigned_officer_id } = req.body;
    try {
        const result = await pool.query(
            "UPDATE polling_stations SET assigned_officer_id = $1 WHERE id = $2 RETURNING *",
            [assigned_officer_id || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Polling station not found." });
        }

        clearPollingStationCache();

        await logAuditActivity({
            userId: req.user?.userId,
            action: "ADMIN_ASSIGN_POLLING_OFFICER",
            description: `Admin assigned Officer ID ${assigned_officer_id || 'NULL'} to Polling Station ID ${id}`,
            req
        });

        res.json({ success: true, pollingStation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getPollingStations, createPollingStation, assignOfficer };
