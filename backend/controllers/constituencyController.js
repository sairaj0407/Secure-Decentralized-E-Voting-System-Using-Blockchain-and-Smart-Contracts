const pool = require("../config/database");

/**
 * Official ECI Constituency Controller
 * Returns genuine, verified Parliamentary Constituencies (Lok Sabha) & Assembly Constituencies (Vidhan Sabha)
 */
const getConstituencies = async (req, res) => {
    try {
        const { type, search, state_id } = req.query;

        if (type === "AC") {
            let query = `
                SELECT ac.id, ac.name, ac.code, 'ASSEMBLY' as level, 
                       s.name as state_name, d.name as district_name, 
                       ac.constituency_number, ac.status, ac.data_status
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
            query += " ORDER BY s.name ASC, ac.constituency_number ASC LIMIT 500";
            const result = await pool.query(query, params);
            return res.json({ success: true, constituencies: result.rows, total: result.rows.length });
        }

        // Default: Genuine Parliamentary Constituencies (Lok Sabha)
        let query = `
            SELECT pc.id, pc.name, pc.code, 'PARLIAMENTARY' as level, 
                   s.name as state_name, pc.constituency_number, 
                   pc.status, pc.data_status
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
        query += " ORDER BY s.name ASC, pc.constituency_number ASC";
        const result = await pool.query(query, params);
        res.json({ success: true, constituencies: result.rows, total: result.rows.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createConstituency = async (req, res) => {
    const { name, code, level, state_id, constituency_number } = req.body;
    if (!name || !code) {
        return res.status(400).json({ success: false, message: "Constituency name and code are required." });
    }
    try {
        const result = await pool.query(
            `INSERT INTO parliamentary_constituencies (name, code, state_id, constituency_number, status, data_status) 
             VALUES ($1, $2, $3, $4, 'ACTIVE', 'OFFICIAL_REFERENCE') RETURNING *`,
            [name, code, state_id || 1, constituency_number || 1]
        );
        res.status(201).json({ success: true, constituency: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getConstituencies, createConstituency };
