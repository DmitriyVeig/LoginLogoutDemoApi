const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');
const logger = require("../utils/logger");
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.connect(undefined)
    .then(() =>
        logger.info("Connected to DB"))
    .catch((err) =>
        logger.error("Error: '" + err + "' while trying to connect to DB"));
module.exports = pool;