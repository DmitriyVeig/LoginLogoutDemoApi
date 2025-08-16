const app = require("./app");
const logger = require("./utils/logger");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

const PORT = process.env.PORT;

app.listen(PORT, () => {
    logger.info('Server running on port ' + PORT);
});