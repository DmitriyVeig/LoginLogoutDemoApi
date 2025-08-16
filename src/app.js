const express = require("express");
const logger = require("./utils/logger");
const app = express();

app.use(express.json())

app.get("/", (req, res) => {
    res.send(".");
});

module.exports = app;
