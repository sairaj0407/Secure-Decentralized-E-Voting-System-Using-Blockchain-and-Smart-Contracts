const pool = require("../config/database");

// ============================================================
// SUBMIT VOTER SERVICE REQUEST (VOTER)
// ============================================================
const submitRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { request_type, category, details } = req.body;

        if (!request_type || !category || !details) {
            return res.status(400).json({
                success: false,
                message: "Request type, category, and details are required."
            });
        }

        const validTypes = ["FORM_8_CORRECTION", "FORM_8_SHIFT", "SAKSHAM_ASSISTANCE", "EPIC_REPLACEMENT"];
        if (!validTypes.includes(request_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid request type. Must be one of: ${validTypes.join(", ")}`
            });
        }

        const result = await pool.query(
            `INSERT INTO voter_service_requests (user_id, request_type, category, details, status)
             VALUES ($1, $2, $3, $4, 'SUBMITTED')
             RETURNING *`,
            [userId, request_type, category, typeof details === "object" ? JSON.stringify(details) : details]
        );

        // Audit log
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, description)
             VALUES ($1, $2, $3)`,
            [
                userId,
                "VOTER_SERVICE_REQUEST_SUBMITTED",
                `Voter submitted ${request_type} request under category "${category}".`
            ]
        );

        res.status(201).json({
            success: true,
            message: "Application submitted successfully to Electoral Registration Officer (ERO).",
            request: result.rows[0]
        });
    } catch (err) {
        console.error("[Voter Service] submitRequest error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// GET CURRENT VOTER'S REQUESTS (VOTER)
// ============================================================
const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT vsr.*, u.name as elector_name, u.voter_id as elector_epic
             FROM voter_service_requests vsr
             JOIN users u ON vsr.user_id = u.id
             WHERE vsr.user_id = $1
             ORDER BY vsr.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            requests: result.rows
        });
    } catch (err) {
        console.error("[Voter Service] getMyRequests error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// GET ALL REQUESTS (ADMIN)
// ============================================================
const getAllRequests = async (req, res) => {
    try {
        const { request_type, status, search } = req.query;
        let query = `
            SELECT vsr.*, 
                   u.name as elector_name, 
                   u.email as elector_email, 
                   u.phone as elector_phone, 
                   u.voter_id as elector_epic,
                   c.name as constituency_name,
                   ps.name as polling_station_name
            FROM voter_service_requests vsr
            JOIN users u ON vsr.user_id = u.id
            LEFT JOIN constituencies c ON u.constituency_id = c.id
            LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
            WHERE 1=1
        `;
        const params = [];

        if (request_type && request_type !== "ALL") {
            params.push(request_type);
            query += ` AND vsr.request_type = $${params.length}`;
        }

        if (status && status !== "ALL") {
            params.push(status);
            query += ` AND vsr.status = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (u.name ILIKE $${params.length} OR u.voter_id ILIKE $${params.length} OR vsr.category ILIKE $${params.length})`;
        }

        query += ` ORDER BY vsr.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({
            success: true,
            requests: result.rows
        });
    } catch (err) {
        console.error("[Voter Service] getAllRequests error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// UPDATE REQUEST STATUS & RESOLUTION (ADMIN)
// ============================================================
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes, auto_apply } = req.body;

        const reqCheck = await pool.query("SELECT * FROM voter_service_requests WHERE id = $1", [id]);
        if (reqCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }
        const currentReq = reqCheck.rows[0];

        const result = await pool.query(
            `UPDATE voter_service_requests
             SET status = COALESCE($1, status),
                 admin_notes = COALESCE($2, admin_notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [status, admin_notes, id]
        );

        // If approved and auto_apply is requested for Form 8, apply changes to user profile
        if (status === "APPROVED" && auto_apply && currentReq.details) {
            const details = typeof currentReq.details === "string" ? JSON.parse(currentReq.details) : currentReq.details;
            const updateFields = [];
            const updateParams = [];

            if (details.name) {
                updateParams.push(details.name);
                updateFields.push(`name = $${updateParams.length}`);
            }
            if (details.phone) {
                updateParams.push(details.phone);
                updateFields.push(`phone = $${updateParams.length}`);
            }
            if (details.address) {
                updateParams.push(details.address);
                updateFields.push(`address = $${updateParams.length}`);
            }
            if (details.pincode) {
                updateParams.push(details.pincode);
                updateFields.push(`pincode = $${updateParams.length}`);
            }
            if (details.relative_name) {
                updateParams.push(details.relative_name);
                updateFields.push(`relative_name = $${updateParams.length}`);
            }
            if (details.relative_type) {
                updateParams.push(details.relative_type);
                updateFields.push(`relative_type = $${updateParams.length}`);
            }
            if (details.gender) {
                updateParams.push(details.gender);
                updateFields.push(`gender = $${updateParams.length}`);
            }

            if (updateFields.length > 0) {
                updateParams.push(currentReq.user_id);
                const sql = `UPDATE users SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updateParams.length}`;
                await pool.query(sql, updateParams);
            }
        }

        // Audit log
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, description)
             VALUES ($1, $2, $3)`,
            [
                req.user.userId,
                "VOTER_SERVICE_STATUS_UPDATED",
                `Admin updated request #${id} (${currentReq.request_type}) status to ${status}. Notes: ${admin_notes || "None"}`
            ]
        );

        res.json({
            success: true,
            message: `Request status updated to ${status}.`,
            request: result.rows[0]
        });
    } catch (err) {
        console.error("[Voter Service] updateRequestStatus error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    submitRequest,
    getMyRequests,
    getAllRequests,
    updateRequestStatus
};
