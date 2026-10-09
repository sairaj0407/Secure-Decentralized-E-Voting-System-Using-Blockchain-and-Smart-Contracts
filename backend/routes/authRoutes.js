const express = require("express");

const {
    register,
    login,
    getCurrentUser,
    getBiometricChallenge
} = require("../controllers/authController");

const {
    sendRegistrationOtp,
    verifyRegistrationOtp
} = require("../controllers/otpController");

const {
    authenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const pool = require("../config/database");

const router = express.Router();

// Biometric Challenge Nonce for Elector Anti-Spoofing (100% Free)
router.get("/biometric-challenge", getBiometricChallenge);

// Mobile OTP Authentication for Elector Registration (100% Free)
router.post("/send-otp", sendRegistrationOtp);
router.post("/verify-otp", verifyRegistrationOtp);

// Register
router.post("/register", register);


// Login
router.post("/login", login);


// Current authenticated user
router.get("/me", authenticate, getCurrentUser);


// Fetch audit logs (ADMIN only)
router.get("/audit-logs", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const { search, action, limit = 200 } = req.query;
        let query = `
            SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role 
            FROM audit_logs a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (a.action ILIKE $${params.length} OR a.description ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
        }
        if (action && action !== "ALL") {
            params.push(action);
            query += ` AND a.action = $${params.length}`;
        }
        query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit) || 200);

        const result = await pool.query(query, params);
        res.json({
            success: true,
            logs: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// Update profile
router.put("/profile", authenticate, async (req, res) => {
    try {
        const { 
            name, 
            phone, 
            address, 
            pincode, 
            relative_name, 
            relative_type, 
            gender, 
            live_photo 
        } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "Name is required." });
        }
        
        let updateQuery = `
            UPDATE users 
            SET name = $1, 
                phone = COALESCE($2, phone), 
                address = COALESCE($3, address),
                pincode = COALESCE($4, pincode),
                relative_name = COALESCE($5, relative_name),
                relative_type = COALESCE($6, relative_type),
                gender = COALESCE($7, gender),
                live_photo = COALESCE($8, live_photo),
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $9 
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [
            name.trim(), 
            phone || null, 
            address || null, 
            pincode || null, 
            relative_name || null, 
            relative_type || null, 
            gender || null, 
            live_photo || null, 
            req.user.userId
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Fetch enriched geographic names for instant UI rendering
        const enrichedQuery = await pool.query(
            `SELECT DISTINCT ON (u.id)
                u.id,
                u.name,
                u.email,
                u.role,
                u.voter_id,
                u.wallet_address,
                u.phone,
                u.dob,
                u.address,
                u.gender,
                u.relative_name,
                u.relative_type,
                u.aadhaar_number,
                u.pincode,
                u.state_id as "stateId",
                u.district_id as "districtId",
                u.assembly_constituency_id as "assemblyConstituencyId",
                u.status,
                u.constituency_id as "constituencyId",
                u.polling_station_id as "pollingStationId",
                u.is_verified,
                u.is_active,
                u.live_photo,
                u.live_photo as "livePhoto",
                u.live_photo as "photo_url",
                u.created_at,
                COALESCE(c.name, ac.name, '') as constituency_name,
                COALESCE(ps.name, '') as polling_station_name,
                COALESCE(ps.code, '') as polling_station_code,
                COALESCE(ps.address, '') as polling_station_address,
                COALESCE(d.name, ac_d.name, '') as district_name,
                COALESCE(s.name, ac_s.name, '') as state_name
             FROM users u
             LEFT JOIN constituencies c ON u.constituency_id = c.id
             LEFT JOIN assembly_constituencies ac ON u.assembly_constituency_id = ac.id
             LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
             LEFT JOIN districts d ON u.district_id = d.id
             LEFT JOIN districts ac_d ON ac.district_id = ac_d.id
             LEFT JOIN states s ON u.state_id = s.id
             LEFT JOIN states ac_s ON ac.state_id = ac_s.id
             WHERE u.id = $1
             ORDER BY u.id ASC`,
            [req.user.userId]
        );
        const enrichedUser = enrichedQuery.rows[0];
        
        // Log audit action
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES ($1, $2, $3)",
            [req.user.userId, "PROFILE_UPDATED", `Voter profile updated: Name="${name}", Phone="${phone || ''}", Address="${address || ''}"`]
        );

        res.json({ 
            success: true, 
            message: "Elector profile updated successfully.", 
            user: enrichedUser 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;