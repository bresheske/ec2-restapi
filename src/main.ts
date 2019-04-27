import express from 'express';
const config = require('../config.json');

// create our webapp, and configure it to be JSON.
const app = express();
app.use(express.json());

// handle all of our routes
app.get('/ping', (request, response) => {
    return response.json({
        message: "pong"
    });
});

// start up our service
app.listen(config.port, () =>
    console.log(`Application listening on port ${config.port}.`),
);
