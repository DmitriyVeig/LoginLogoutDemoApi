const pool = require("../config/db");
const logger = require("../utils/logger");

async function getUsers(req, res) {
    try {
        const users = (await pool.query("SELECT * FROM users")).rows;
        res.json(users);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getUsers }