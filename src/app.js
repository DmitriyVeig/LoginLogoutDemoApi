const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./docs/swagger.yaml");
const AuthRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();

app.use(express.json())

app.use("/api/users/auth", AuthRoutes)
app.use("/api/users", usersRoutes);

app.get("/", (req, res) => {
    res.send(".");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
