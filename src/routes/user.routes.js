const express = require("express");
const { register, login, users, sessions } = require("../controllers/user.controller");

const router = express.Router();

router.post("/users/register", register);
router.post("/users/login", login);

router.get("/users", users);
router.get("/users/sessions", sessions);

module.exports = router;