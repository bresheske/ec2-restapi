import express, { response } from 'express';
import * as tokens from '../auth/token';
import { IncomingHttpHeaders } from 'http';
import { getLogger } from '../utils/logger';

const commonResponses = {
    authorizationError: {
        status: 403
    }
};

const logger = getLogger();

/**
 * just returns the user's authentication header.
 * @param headers request headers
 */
function getAuthHeader(headers: IncomingHttpHeaders): string | null {
    let authHeader =  
        headers['authentication']
        || headers['Authentication']
        || headers['AUTHENTICATION'];
    if (!authHeader) {
        return null;
    }
    return Array.isArray(authHeader)
        ? authHeader[0]
        : authHeader;
}

/**
 * defines all of the routes for our application
 * @param app express app
 */
export function registerRoutes(app: express.Express) {

    // all routes that do not require authentication first
    app.get('/ping', (request, response) => {
        return response.json({
            message: "pong"
        });
    });

    // allow all OPTIONS calls for preflight CORS checks.
    app.options('/*', (request, response) => {
        response.status(204);
        return response.json();
    });

    // register authentication here
    app.use((req, res, next) => {
        // get our auth header, if it doesn't exist just kick out early.
        const tokenStr = getAuthHeader(req.headers);
        if (!tokenStr || tokenStr.length === 0) {
            logger.writeWarnLine(`router.auth: auth header not present. route: ${req.url}. method: ${req.method}.`);
            res.status(commonResponses.authorizationError.status);
            return res.json();
        }
        
        // first we decode the token and make sure a user (subject) was passed.
        const token = tokens.decodeToken(tokenStr);
        const user = token && token.payload && token.payload.sub;
        if (!user) {
            res.status(commonResponses.authorizationError.status);
            return res.json();
        }

        // now we validate our token.
        const tokenValidation = tokens.verifyJwt(user, tokenStr);
        if (!tokenValidation) {
            res.status(commonResponses.authorizationError.status);
            return res.json();
        }

        // we have a valid token.
        next();
    });

    // all routes that require authentication before execution
    app.get('/authPing', (request, response) => {
        return response.json({
            message: "pong"
        });
    });
    

    
}