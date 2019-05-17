import { get } from '../utils/request';
import * as tokens from '../../src/auth/token';

describe(`ping`, () => {
    const url = '/ping';
    const authUrl = '/authPing';
    it(`should return success`, async () => {
        const result = await get(url);
        expect(result.status).toBe(200);
    });
    it(`should return pong message`, async () => {
        const result = await get(url);
        expect(result.data.message).toBe('pong');
    });
    it(`should return unauthenticated`, async () => {
        const result = await get(authUrl);
        expect(result.status).toBe(403);
    });
    it(`should return authenticated pong message`, async() => {
        const token = tokens.createJwt(`brandon`, { displayName: `Brandon R` });
        const result = await get(authUrl, token);
        expect(result.status).toBe(200);
        expect(result.data.message).toBe('pong');
    });
});