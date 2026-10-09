const pool = require("../config/database");

const getVoters = async (req, res) => {
    const { search = "", role = "VOTER", status, constituency_id, state } = req.query;
    try {
        let query = `
            SELECT DISTINCT ON (u.id)
                   u.id, u.name, u.email, u.role, u.status, u.is_verified, u.is_active, 
                   u.voter_id, u.wallet_address, u.phone, u.dob, u.address,
                   u.gender, u.relative_name, u.relative_type, u.aadhaar_number, u.pincode,
                   u.state_id, u.district_id, u.assembly_constituency_id, u.constituency_id, u.polling_station_id,
                   COALESCE(c.name, ac.name, '') as constituency_name, 
                   COALESCE(ps.name, '') as polling_station_name, 
                   COALESCE(ps.code, '') as polling_station_code,
                   COALESCE(d.name, ac_d.name, '') as district_name, 
                   COALESCE(s.name, ac_s.name, '') as state_name,
                   u.created_at
            FROM users u
            LEFT JOIN constituencies c ON u.constituency_id = c.id
            LEFT JOIN assembly_constituencies ac ON u.assembly_constituency_id = ac.id
            LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
            LEFT JOIN districts d ON u.district_id = d.id
            LEFT JOIN districts ac_d ON ac.district_id = ac_d.id
            LEFT JOIN states s ON u.state_id = s.id
            LEFT JOIN states ac_s ON ac.state_id = ac_s.id
            WHERE 1=1
        `;
        const params = [];

        if (role && role !== "ALL") {
            params.push(role);
            query += ` AND u.role = $${params.length}`;
        }
        if (status && status !== "ALL") {
            params.push(status);
            query += ` AND u.status = $${params.length}`;
        }
        if (constituency_id) {
            params.push(constituency_id);
            query += ` AND (u.constituency_id = $${params.length} OR u.assembly_constituency_id = $${params.length})`;
        }
        if (state && state !== "ALL") {
            params.push(`%${state}%`);
            query += ` AND (u.address ILIKE $${params.length} OR c.name ILIKE $${params.length} OR s.name ILIKE $${params.length})`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.voter_id ILIKE $${params.length} OR u.address ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR s.name ILIKE $${params.length} OR d.name ILIKE $${params.length})`;
        }

        query += " ORDER BY u.id ASC";

        const result = await pool.query(query, params);
        res.json({ success: true, voters: result.rows, total: result.rows.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateVoterStatus = async (req, res) => {
    const { id } = req.params;
    const { status, is_verified, is_active, role, constituency_id, polling_station_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users 
             SET status = COALESCE($1, status), 
                 is_verified = COALESCE($2, is_verified), 
                 is_active = COALESCE($3, is_active),
                 role = COALESCE($4, role),
                 constituency_id = COALESCE($5, constituency_id),
                 polling_station_id = COALESCE($6, polling_station_id),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [status, is_verified, is_active, role, constituency_id, polling_station_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ success: true, voter: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const checkDuplicateVoters = async (req, res) => {
    try {
        // Query to check for users with identical wallet addresses or voter IDs or similar names and DOB
        const emailDups = await pool.query(`
            SELECT email, COUNT(*) as count 
            FROM users 
            GROUP BY email 
            HAVING COUNT(*) > 1
        `);
        const walletDups = await pool.query(`
            SELECT wallet_address, COUNT(*) as count 
            FROM users 
            WHERE wallet_address IS NOT NULL AND wallet_address <> ''
            GROUP BY wallet_address 
            HAVING COUNT(*) > 1
        `);
        const voterIdDups = await pool.query(`
            SELECT voter_id, COUNT(*) as count 
            FROM users 
            WHERE voter_id IS NOT NULL AND voter_id <> ''
            GROUP BY voter_id 
            HAVING COUNT(*) > 1
        `);

        res.json({
            success: true,
            duplicates: {
                emails: emailDups.rows,
                wallets: walletDups.rows,
                voterIds: voterIdDups.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const exportVoterRoll = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT ON (u.id)
                   u.id, u.name, u.email, u.role, u.status, u.is_verified, u.is_active, u.voter_id, u.wallet_address,
                   u.phone, u.dob, u.address,
                   COALESCE(s.name, ac_s.name, '') as state_name,
                   COALESCE(d.name, ac_d.name, '') as district_name,
                   COALESCE(c.name, ac.name, '') as constituency_name, 
                   COALESCE(ps.name, '') as polling_station_name
            FROM users u
            LEFT JOIN constituencies c ON u.constituency_id = c.id
            LEFT JOIN assembly_constituencies ac ON u.assembly_constituency_id = ac.id
            LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
            LEFT JOIN districts d ON u.district_id = d.id
            LEFT JOIN districts ac_d ON ac.district_id = ac_d.id
            LEFT JOIN states s ON u.state_id = s.id
            LEFT JOIN states ac_s ON ac.state_id = ac_s.id
            ORDER BY u.id ASC
        `);

        let csv = "ID,Name,Email,Role,Status,Verified,Active,VoterID,WalletAddress,Phone,DOB,StateAddress,State,District,Constituency,PollingStation\n";
        for (const row of result.rows) {
            csv += `"${row.id}","${row.name}","${row.email}","${row.role}","${row.status}","${row.is_verified}","${row.is_active}","${row.voter_id || ""}","${row.wallet_address || ""}","${row.phone || ""}","${row.dob || ""}","${(row.address || "").replace(/"/g, '""')}","${row.state_name || ""}","${row.district_name || ""}","${row.constituency_name || ""}","${row.polling_station_name || ""}"\n`;
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=national_electoral_roll.csv");
        res.send(csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getVoters, updateVoterStatus, checkDuplicateVoters, exportVoterRoll };
