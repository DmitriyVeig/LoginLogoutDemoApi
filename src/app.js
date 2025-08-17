const express = require("express");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

app.use(express.json())

const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

app.get("/", (req, res) => {
    res.send(".");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
