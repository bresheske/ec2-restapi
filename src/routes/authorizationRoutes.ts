import express = require("express");
import * as tokens from '../auth/token';
import * as common from './common';
import { IncomingHttpHeaders } from 'http';
import { getLogger } from '../utils/logger';
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

export function registerAuth(app: express.Express) {
    app.use((req, res, next) => {
        // get our auth header, if it doesn't exist just kick out early.
        const tokenStr = getAuthHeader(req.headers);
        if (!tokenStr || tokenStr.length === 0) {
            logger.writeWarnLine(`router.auth: auth header not present. route: ${req.url}. method: ${req.method}.`);
            res.status(common.getCommonResponses().authorizationError.status);
            return res.json();
        }

        // first we decode the token and make sure a user (subject) was passed.
        const token = tokens.decodeToken(tokenStr);
        const user = token && token.payload && token.payload.sub;
        if (!user) {
            logger.writeWarnLine(`router.auth: token failed to decode: ${req.url}. method: ${req.method}.`);
            res.status(common.getCommonResponses().authorizationError.status);
            return res.json();
        }

        // now we validate our token.
        const tokenValidation = tokens.verifyJwt(user, tokenStr);
        if (!tokenValidation) {
            logger.writeWarnLine(`router.auth: jwt failed to validate: ${req.url}. method: ${req.method}.`);
            res.status(common.getCommonResponses().authorizationError.status);
            return res.json();
        }

        // we have a valid token.
        next();
    });
}