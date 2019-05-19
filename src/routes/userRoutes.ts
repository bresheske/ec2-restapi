import express = require("express");
import * as user from '../entities/user';
import * as common from './common';
import { getLogger } from '../utils/logger';
const logger = getLogger();

export function registerAuth(app: express.Express) {
    // create a new user
    app.put('/user', async (request, response) => {
        if (!user.validate(request.body, user.RequestType.Create)) {
            logger.writeWarnLine(`router.user: validation failed. route: ${request.url}. method: ${request.method}.`);
            return response
                .status(common.getCommonResponses().validationError.status)
                .json();
        }
        // here we copy parts of the object from the body.
        // this is to ensure we don't pass the full body into our SQL, which
        // could be a bit of a security thing.
        const sentUser: user.User = request.body;
        let newUser = <user.User> {
            createdBy: sentUser.createdBy,
            password: sentUser.password,
            userName: sentUser.userName
        };
        newUser = await user.create(newUser);
        return response
            .status(200)
            .json(newUser);
    });

    // get a user by id
    app.get('/user/:id', async(request, response) => {
        if (!user.validate(request.params, user.RequestType.Get)) {
            logger.writeWarnLine(`router.user: validation failed. route: ${request.url}. method: ${request.method}.`);
            return response
                .status(common.getCommonResponses().validationError.status)
                .json();
        }
        const id: number = request.params.id;
        const resp = await user.get(id);
        return response
            .status(200)
            .json(resp);
    });
}