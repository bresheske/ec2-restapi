import express = require("express");
import * as user from '../entities/user';
import { getLogger } from '../utils/logger';
import * as common from './common';
import * as tokens from '../auth/token';
const logger = getLogger();

export function registerPreAuth(app: express.Express) {
    // authenticate against the system and gain a token.
    app.post('/auth', async (request, response) => {
        if (!user.validate(request.body, user.RequestType.GetByUsernamePassword)) {
            logger.writeWarnLine(`router.token: validation failed. route: ${request.url}. method: ${request.method}.`);
            return response
                .status(common.getCommonResponses().validationError.status)
                .json();
        }
        const sentUser: user.User = request.body;
        const oldUser = await user.getByUsernamePassword(sentUser.userName, sentUser.password);
        if (!oldUser) {
            logger.writeWarnLine(`router.token: username/password check failed. route: ${request.url}. method: ${request.method}.`);
            return response
                .status(common.getCommonResponses().validationError.status)
                .json();
        }
        const token = tokens.createJwt(oldUser.userName, {});
        return response
            .json(token);
    });
}
