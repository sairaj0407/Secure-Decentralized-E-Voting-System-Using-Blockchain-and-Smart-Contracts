const pool = require("../config/database");

// Helper: Get list of valid table names in public schema
async function getValidTables() {
    const res = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
    return res.rows.map(r => r.table_name);
}

// 1. Get Database Overview & List of all tables with row counts and sizes
const getDatabaseOverview = async (req, res) => {
    try {
        const dbName = process.env.DB_NAME || "evoting_db";
        const sizeRes = await pool.query("SELECT pg_size_pretty(pg_database_size($1)) as size", [dbName]);
        const verRes = await pool.query("SELECT version()");

        const tablesRes = await pool.query(`
            SELECT 
                t.table_name,
                pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name))) as total_size,
                (
                    SELECT count(*) 
                    FROM information_schema.columns c 
                    WHERE c.table_name = t.table_name AND c.table_schema = 'public'
                ) as column_count
            FROM information_schema.tables t
            WHERE t.table_schema = 'public'
            ORDER BY t.table_name ASC
        `);

        let totalRecords = 0;
        const tables = [];

        for (const row of tablesRes.rows) {
            let rowCount = 0;
            try {
                const countRes = await pool.query(`SELECT count(*) as cnt FROM "${row.table_name}"`);
                rowCount = parseInt(countRes.rows[0].cnt, 10) || 0;
            } catch (err) {
                rowCount = 0;
            }

            totalRecords += rowCount;
            tables.push({
                table_name: row.table_name,
                total_size: row.total_size,
                rows: rowCount,
                columns: parseInt(row.column_count, 10) || 0
            });
        }

        res.json({
            success: true,
            database: {
                name: dbName,
                host: process.env.DB_HOST || "localhost",
                port: process.env.DB_PORT || 5432,
                size: sizeRes.rows[0]?.size || "N/A",
                version: (verRes.rows[0]?.version || "").split(",")[0],
                totalTables: tables.length,
                totalRecords
            },
            tables
        });
    } catch (err) {
        console.error("[Database Controller] Overview error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Get Paginated Table Data & Schema
const getTableData = async (req, res) => {
    try {
        const { tableName } = req.params;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(10, parseInt(req.query.limit, 10) || 25));
        const offset = (page - 1) * limit;
        const search = req.query.search ? req.query.search.trim() : "";
        const sortBy = req.query.sortBy || "id";
        const sortDir = (req.query.sortDir || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

        // Security validation
        const validTables = await getValidTables();
        if (!validTables.includes(tableName)) {
            return res.status(400).json({ success: false, message: `Table '${tableName}' does not exist in the database.` });
        }

        // Fetch columns schema
        const colRes = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position ASC
        `, [tableName]);

        const columns = colRes.rows;
        const colNames = columns.map(c => c.column_name);

        // Determine safe sort column
        const safeSortBy = colNames.includes(sortBy) ? sortBy : colNames[0];

        // Build Search Query if search string provided
        let whereClause = "";
        const queryParams = [];

        if (search) {
            const searchableCols = columns.filter(c => 
                ["character varying", "text", "varchar", "character", "integer", "bigint"].includes(c.data_type)
            ).map(c => c.column_name);

            if (searchableCols.length > 0) {
                const searchConditions = searchableCols.map(col => `CAST("${col}" AS TEXT) ILIKE $1`);
                whereClause = `WHERE ${searchConditions.join(" OR ")}`;
                queryParams.push(`%${search}%`);
            }
        }

        // Count total matching rows
        const countQuery = `SELECT count(*) as total FROM "${tableName}" ${whereClause}`;
        const countRes = await pool.query(countQuery, queryParams);
        const totalRows = parseInt(countRes.rows[0]?.total, 10) || 0;
        const totalPages = Math.ceil(totalRows / limit);

        // Fetch data rows
        const dataParams = [...queryParams, limit, offset];
        const limitParamIdx = queryParams.length + 1;
        const offsetParamIdx = queryParams.length + 2;

        const dataQuery = `
            SELECT * FROM "${tableName}" 
            ${whereClause} 
            ORDER BY "${safeSortBy}" ${sortDir} 
            LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}
        `;

        const dataRes = await pool.query(dataQuery, dataParams);

        // Mask password hashes if inspecting users table
        const rows = dataRes.rows.map(r => {
            const copy = { ...r };
            if (copy.password_hash) {
                copy.password_hash = "[ENCRYPTED BCRYPT HASH]";
            }
            return copy;
        });

        res.json({
            success: true,
            tableName,
            totalRows,
            page,
            limit,
            totalPages,
            columns,
            rows
        });
    } catch (err) {
        console.error(`[Database Controller] Error fetching table ${req.params.tableName}:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getDatabaseOverview,
    getTableData
};
