const pool = require("../config/database");

/**
 * Log administrative or system activity into immutable audit_logs table
 * @param {Object} params
 * @param {number|string|null} [params.userId] - User ID performing the action
 * @param {string} params.action - Canonical action code (e.g., ADMIN_UPDATE_ELECTION)
 * @param {string} params.description - Human-readable explanation of changes
 * @param {Object} [params.req] - Express request object to automatically extract IP and user
 * @param {string} [params.ipAddress] - Optional explicit IP address
 */
async function logAuditActivity({ userId, action, description, req, ipAddress }) {
    try {
        let clientIp = ipAddress;
        if (!clientIp && req) {
            clientIp = (
                req.headers["x-forwarded-for"] ||
                req.headers["x-real-ip"] ||
                (req.socket && req.socket.remoteAddress) ||
                req.ip ||
                "127.0.0.1"
            ).split(",")[0].trim();
        }
        
        // PostgreSQL inet type supports standard IPv4/IPv6. Clean common loopbacks
        if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
            clientIp = "127.0.0.1";
        } else if (clientIp && clientIp.startsWith("::ffff:")) {
            clientIp = clientIp.replace("::ffff:", "");
        }

        const resolvedUserId = userId || (req && req.user ? (req.user.userId || req.user.id) : null);

        const res = await pool.query(
            `INSERT INTO audit_logs (user_id, action, description, ip_address, created_at)
             VALUES ($1, $2, $3, $4::inet, CURRENT_TIMESTAMP)
             RETURNING id, user_id, action, description, ip_address, created_at`,
            [resolvedUserId ? parseInt(resolvedUserId) : null, action, description, clientIp || null]
        );
        return res.rows[0];
    } catch (err) {
        console.error("[AuditLogger] Failed to write audit log:", err.message);
        return null;
    }
}

module.exports = { logAuditActivity };
