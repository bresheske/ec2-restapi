import express from 'express';
import { getLogger } from "./utils/logger";
import { registerRoutes } from "./routes/router";
const config = require('../environments/config.json');
const logger = getLogger();

// create our webapp, and configure it to be JSON.
const app = express();
app.use(express.json());

// handle all of our routes
registerRoutes(app);

// start up our service
app.listen(config.port, () => {
    logger.writeInfoLine(`Application listening on port ${config.port}.`);
});
