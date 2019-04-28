import { get } from './utils/request';

describe(`ping`, () => {
    const url = '/ping';
    it(`should return success`, async () => {
        const result = await get(url);
        expect(result.status).toBe(200);
    });
    it(`should return pong message`, async () => {
        const result = await get(url);
        expect(result.data.message).toBe('pong');
    });
});