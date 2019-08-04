import { put } from '../utils/request';
import * as tokens from '../../src/auth/token';
import { AxiosPromise } from 'axios';
import * as chunker from '../../src/utils/chunkWork';

describe(`load - create users`, () => {
    const url = '/user';
    const authUrl = '/auth';
    const concurrency = 500;
    const total = 5000;
    const timeout = 60000;

    let id: number;
    let authenticatedToken: string;
    it(`should create load users`, async() => {
        const token = tokens.createJwt(`brandon`, { displayName: `Brandon R` });
        const work: (() => AxiosPromise)[] = [];
        for (let i = 0; i < total; i++) {
            const user = {
                userName: `BrandonR${i}`,
                password: 'secret',
                createdBy: 'automation-integration'
            };
            work.push(() => put(url, user, token));
        };

        const results = await chunker.processWork(work, concurrency);
        const successes = results.filter(r => r.status === 200).length;
        const failures = results.filter(r => r.status !== 200).length;

        expect(successes).toBe(total);
        expect(failures).toBe(0);
    }, timeout);
});
