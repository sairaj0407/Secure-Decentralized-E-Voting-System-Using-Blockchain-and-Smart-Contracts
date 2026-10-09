const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
};


// ============================================================
// ROLE AUTHORIZATION
// ============================================================

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        let roleMatches = allowedRoles.includes(req.user.role);

        // Fallback wildcard: If route specifies 'ADMIN', permit any administrative level role
        if (allowedRoles.includes("ADMIN")) {
            const adminRoles = [
                "ADMIN", "SUPER_ADMIN", "ELECTION_COMMISSIONER", 
                "STATE_ELECTION_OFFICER", "DISTRICT_ELECTION_OFFICER", 
                "RETURNING_OFFICER", "PRESIDING_OFFICER", "POLLING_OFFICER",
                "AUDITOR", "OBSERVER"
            ];
            if (adminRoles.includes(req.user.role)) {
                roleMatches = true;
            }
        }

        if (!roleMatches) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource."
            });
        }

        next();
    };
};


// ============================================================
// OPTIONAL AUTHENTICATION
// ============================================================

const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
    } catch (error) {
        // Proceed without req.user for optional auth
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuthenticate,
    authorizeRoles
};