const express = require("express");
const { register,  login,  logout,  refresh, getSessions } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", authenticate, refresh);
router.post("/logout", authenticate, logout);
router.get("/sessions", getSessions);

module.exports = router;