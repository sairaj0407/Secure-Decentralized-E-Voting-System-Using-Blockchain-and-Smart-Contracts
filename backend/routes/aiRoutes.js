const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { handleChat } = require("../controllers/aiController");

// Optional authentication middleware:
// Allows unauthenticated citizens to consult Chunav Mitra,
// while populating req.user if a valid JWT is provided.
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
    } catch (err) {
        // If token is invalid or expired, proceed as anonymous elector
        req.user = null;
    }
    next();
};

// Route: POST /api/ai/chat
router.post("/chat", optionalAuth, handleChat);

module.exports = router;
