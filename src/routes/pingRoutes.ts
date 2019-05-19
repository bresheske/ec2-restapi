import express = require("express");

export function registerPreAuth(app: express.Express) {
    app.get('/ping', (request, response) => {
        return response.json({
            message: "pong"
        });
    });
}

export function registerAuth(app: express.Express) {
    app.get('/authPing', (request, response) => {
        return response.json({
            message: "pong"
        });
    });
}