const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), debug: false });

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const SALT_ROUNDS = 10;
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
function generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}
module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};