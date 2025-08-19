const express = require("express");
const { getUsers } = require("../controllers/users.controller");

const router = express.Router();

router.post("/", getUsers);

module.exports = router;