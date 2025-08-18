const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const pool = require("../config/db");
const logger = require("../utils/logger");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

async function users(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM users',
        );
        res.status(200).json(result.rows);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function sessions(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM sessions',
        );
        res.status(200).json(result.rows);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function register(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `SELECT add_user($1, $2) as user_id`,
            [username, hashedPassword]
        );
        const userId = result.rows[0].user_id;
        res.status(201).json({ message: "User created", userId });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Username already exists" });
        }
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }
    try {
        const userResult = await pool.query(
            `SELECT id, password FROM users WHERE username = $1`,
            [username]
        );
        if (userResult.rowCount === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const user = userResult.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const sessionResult = await pool.query(
            `SELECT login_user($1, $2) as session_id`,
            [username, user.password]
        );
        const sessionId = sessionResult.rows[0].session_id;
        const token = jwt.sign({ userId: user.id, sessionId }, JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { register, login, users, sessions };