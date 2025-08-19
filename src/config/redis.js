const Redis = require("ioredis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.error("Redis error:", err);
});

module.exports = redis;