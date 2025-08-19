const Redis = require("ioredis");
const path = require("path");
const logger = require("../utils/logger");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
    logger.info("Connected to Redis");
});

redis.on("error", (err) => {
    logger.error("Redis error:", err);
});

module.exports = redis;