import express from 'express';
const config = require('../config.json');

// create our webapp, and configure it to be JSON.
const app = express();
app.use(express.json());

// handle all of our routes
app.get('/', (request, response) => {
    return response.json({
        message: "hi."
    });
});

// start up our service
app.listen(config.port, () =>
    console.log(`Example app listening on port ${config.port}!`),
);
