const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./src/docs/swagger.yaml");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(express.json())

app.use("/api", userRoutes)

app.get("/", (req, res) => {
    res.send(".");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
