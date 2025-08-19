const path = require("path");
const pool = require("../config/db");
const redis = require("../config/redis");
const logger = require("../utils/logger");
const { hashPassword, comparePassword, generateToken } = require("../utils/jwt");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const SESSION_TTL = parseInt(process.env.SESSION_TTL || "3600", 10);

async function register(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });
    try {
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE username = $1", [username]
        );
        if (existingUser.rowCount > 0)
            return res.status(409).json({ error: "Username already exists" });
        const hashedPassword = await hashPassword(password);
        const result = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
            [username, hashedPassword]
        );
        res.status(201).json({ message: "User created", userId: result.rows[0].id });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });
    try {
        const userResult = await pool.query(
            "SELECT id, password FROM users WHERE username = $1", [username]
        );
        if (userResult.rowCount === 0)
            return res.status(401).json({ error: "Invalid username or password" });
        const user = userResult.rows[0];
        const match = await comparePassword(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid username or password" });
        const sessionId = crypto.randomUUID();
        await redis.setex(
            `session:${sessionId}`,
            SESSION_TTL,
            JSON.stringify({ userId: user.id })
        );
        const token = generateToken({ userId: user.id, sessionId }, "1h");
        res.json({ token });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function logout(req, res) {
    try {
        const { sessionId } = req.user;
        await redis.del(`session:${sessionId}`);
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function refresh(req, res) {
    try {
        const { userId, sessionId } = req.user;
        const sessionKey = `session:${sessionId}`;
        const exists = await redis.exists(sessionKey);
        if (!exists) return res.status(401).json({ error: "Session expired" });
        await redis.expire(sessionKey, SESSION_TTL);
        const token = generateToken({ userId, sessionId }, "1h");
        res.json({ token });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getSessions(req, res) {
    try {
        const { userId } = req.user;
        const keys = await redis.keys("session:*");
        const sessions = [];
        for (const key of keys) {
            const data = await redis.get(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.userId === userId) {
                    sessions.push({ sessionId: key.split(":")[1] });
                }
            }
        }
        res.json(sessions);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { register, login, logout, refresh, getSessions };