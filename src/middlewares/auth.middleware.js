const logger = require("../utils/logger");
const { verifyToken } = require("../utils/jwt");
const redis = require("../config/redis");

async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });
        const payload = verifyToken(token);
        if (!payload) return res.status(401).json({ error: "Invalid token" });
        const sessionKey = `session:${payload.sessionId}`;
        const sessionData = await redis.get(sessionKey);
        if (!sessionData) return res.status(401).json({ error: "Session expired or revoked" });
        req.user = payload;
        next();
    } catch (err) {
        logger.error(err);
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = { authenticate };