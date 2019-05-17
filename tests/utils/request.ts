import * as axios from 'axios';
import { getEnvironment } from './environment';
const req = axios.default;
const env = getEnvironment();

export function get(url: string, token?: string): axios.AxiosPromise {
    const fullUrl = env.protocol + '://' + env.location + ':' + env.port + url;
    const headers = token
        ? { 'authentication': token }
        : null;
    // tell axios to not throw any errors if the server returns some crazy status codes.
    return req.get(fullUrl, { validateStatus: () => true, headers });
}
