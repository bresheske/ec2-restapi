import { get, put, post } from '../utils/request';
import * as tokens from '../../src/auth/token';
import { User } from '../../src/entities/user';

describe(`ping`, () => {
    const url = '/user';
    const authUrl = '/auth';

    let id: number;
    let authenticatedToken: string;
    it(`should create a new user`, async() => {
        const token = tokens.createJwt(`brandon`, { displayName: `Brandon R` });
        const user = {
            userName: 'BrandonR',
            password: 'secret',
            createdBy: 'automation-integration'
        };
        const result = await put(url, user, token);
        const resultUser: User = result.data;
        expect(result.status).toBe(200);
        expect(resultUser.id).toBeTruthy();
        expect(resultUser.password).toBeFalsy();
        id = resultUser.id;
    });

    it(`should get new user`, async() => {
        const token = tokens.createJwt(`brandon`, { displayName: `Brandon R` });
        const result = await get(`${url}/${id}`, token);
        const resultUser: User = result.data;
        expect(result.status).toBe(200);
        expect(resultUser.id).toBeTruthy();
        expect(resultUser.password).toBeFalsy();
    });

    it(`should authenticate against the new user`, async() => {
        const authRequest = { userName: 'BrandonR', password: 'secret' };
        const tokenResp = await post(authUrl, authRequest);
        expect(tokenResp.data).toBeTruthy();
        authenticatedToken = tokenResp.data;
    });

    it(`should not authenticate with incorrect password`, async() => {
        const authRequest = { userName: 'BrandonR', password: 'secreT' };
        const tokenResp = await post(authUrl, authRequest);
        expect(tokenResp.status).toEqual(400);
        expect(tokenResp.data).toBeFalsy();
    });

    it(`should not authenticate with incorrect user`, async() => {
        const authRequest = { userName: 'Brandon_R', password: 'secret' };
        const tokenResp = await post(authUrl, authRequest);
        expect(tokenResp.status).toEqual(400);
        expect(tokenResp.data).toBeFalsy();
    });

    it(`should get new user with authenticated token`, async() => {
        const token = authenticatedToken;
        const result = await get(`${url}/${id}`, token);
        const resultUser: User = result.data;
        expect(result.status).toBe(200);
        expect(resultUser.id).toBeTruthy();
        expect(resultUser.password).toBeFalsy();
    }); 
});