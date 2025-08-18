const express = require("express");
const { register, login, users, sessions } = require("../controllers/user.controller");

const router = express.Router();

router.post("/api/users/register", register);
router.post("/api/users/login", login);
router.post("/api/users", users);
router.post("/api/users/sessions", sessions);

module.exports = router;