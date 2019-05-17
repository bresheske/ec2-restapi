import express from 'express';
import { getLogger } from "./utils/logger";
import { registerRoutes } from "./routes/router";
const config = require('../config.json');
const logger = getLogger();

// create our webapp, and configure it to be JSON.
const app = express();
app.use(express.json());

// add some headers, like CORS.
app.use(function(req, res, next) {
    const allowedHeaders = [
        'authentication',
        'Authentication',
        'AUTHENTICATION',
        'Content-Type'
    ];
    const allowedMethods = [
        'GET',
        'OPTIONS'
    ];
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', allowedMethods.join(','));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(','));
    next();
});

// handle all of our routes
registerRoutes(app);

// start up our service
app.listen(config.port, () => {
    logger.writeInfoLine(`Application listening on port ${config.port}.`);
});
