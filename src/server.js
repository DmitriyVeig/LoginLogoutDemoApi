const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT;

app.listen(PORT, () => {
    logger.info('Server running on port ' + PORT);
});