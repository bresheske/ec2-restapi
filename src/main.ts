import express from 'express';
const config = require('../config.json');

// create our webapp, and configure it to be JSON.
const app = express();
app.use(express.json());

// add some headers, like CORS.
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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
