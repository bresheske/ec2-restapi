import express, { response } from 'express';
import * as pingRoutes from './pingRoutes';
import * as authRoutes from './authorizationRoutes';
import * as userRoutes from './userRoutes';
import * as tokenRoutes from './tokenRoutes';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * defines all of the routes for our application
 * @param app express app
 */
export function registerRoutes(app: express.Express) {

    // just some proper logging
    app.use((req, res, next) => {
        logger.writeDebugLine(`router: method: ${req.method}. url: ${req.url}`);
        next();
    });

    // add some headers, like CORS.
    app.use((req, res, next) => {
        const allowedHeaders = [
            'authentication',
            'Authentication',
            'AUTHENTICATION',
            'Content-Type'
        ];
        const allowedMethods = [
            'GET',
            'PUT',
            'POST',
            'OPTIONS'
        ];
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', allowedMethods.join(','));
        res.header('Access-Control-Allow-Headers', allowedHeaders.join(','));
        next();
    });

    // allow all OPTIONS calls for preflight CORS checks.
    app.options('/*', (request, response) => response.json());

    // all routes that do not require authentication first
    pingRoutes.registerPreAuth(app);
    tokenRoutes.registerPreAuth(app);

    // register authentication here
    authRoutes.registerAuth(app);

    // all routes that require authentication before execution
    pingRoutes.registerAuth(app);
    userRoutes.registerAuth(app);
}