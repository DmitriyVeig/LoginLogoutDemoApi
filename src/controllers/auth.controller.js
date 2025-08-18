const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const pool = require("../config/db");
const logger = require("../utils/logger");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });
    try {
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1', [username]);
        if (existingUser.rowCount > 0)
            return res.status(409).json({ error: "Username already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
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
            'SELECT id, password FROM users WHERE username = $1', [username]);
        if (userResult.rowCount === 0)
            return res.status(401).json({ error: "Invalid username or password" });
        const user = userResult.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid username or password" });
        const sessionResult = await pool.query(
            `INSERT INTO sessions(user_id, expires_at)
             VALUES ($1, now() + $2::interval)
             RETURNING session_id`,
            [user.id, SESSION_TTL]
        );
        const sessionId = sessionResult.rows[0].session_id;
        const token = jwt.sign(
            { userId: user.id, sessionId }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function logout(req, res) {
    try {
        const sessionId = req.user.sessionId;
        await pool.query(
            'UPDATE sessions SET revoked_at = now() WHERE session_id = $1',
            [sessionId]
        );
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function refresh(req, res) {
    try {
        const { userId, sessionId } = req.user;
        await pool.query(
            'UPDATE sessions SET expires_at = now() + $1::interval WHERE session_id = $2 AND revoked_at IS NULL',
            [SESSION_TTL, sessionId]
        );
        const token = jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getSessions(req, res) {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            'SELECT session_id, created_at, expires_at, revoked_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}
module.exports = { register, login, logout, refresh, getSessions };