const pool = require("../config/database");

const getParties = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM parties ORDER BY name");
        res.json({ success: true, parties: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createParty = async (req, res) => {
    const { name, abbreviation, symbol, leader, contact_info } = req.body;
    if (!name || !abbreviation || !symbol) {
        return res.status(400).json({ success: false, message: "Name, abbreviation, and symbol are required fields." });
    }
    try {
        const result = await pool.query(
            `INSERT INTO parties (name, abbreviation, symbol, leader, contact_info) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, abbreviation, symbol, leader || null, contact_info || null]
        );
        res.status(201).json({ success: true, party: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getParties, createParty };
