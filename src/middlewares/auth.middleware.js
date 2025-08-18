const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });
        const payload = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            `SELECT 1 FROM sessions WHERE session_id = $1 AND expires_at > now() AND revoked_at IS NULL`,
            [payload.sessionId]
        );
        if (result.rowCount === 0) return res.status(401).json({ error: "Session expired or revoked" });
        req.user = payload;
        next();
    } catch (err) {
        logger.error(err);
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = { authenticate };
