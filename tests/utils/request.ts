import * as axios from 'axios';
import { getEnvironment } from './environment';
const req = axios.default;
const env = getEnvironment();

export function get(url: string, token?: string): axios.AxiosPromise {
    const fullUrl = env.protocol + '://' + env.location + ':' + env.port + url;
    const headers = token
        ? { 'authentication': token }
        : null;
    return req.get(fullUrl, { validateStatus: () => true, headers });
}

export function put(url: string, body?: any, token?: string): axios.AxiosPromise {
    const fullUrl = env.protocol + '://' + env.location + ':' + env.port + url;
    const headers = token
        ? { 'authentication': token }
        : null;
    return req.put(fullUrl, body, { validateStatus: () => true, headers });
}

export function post(url: string, body?: any, token?: string): axios.AxiosPromise {
    const fullUrl = env.protocol + '://' + env.location + ':' + env.port + url;
    const headers = token
        ? { 'authentication': token }
        : null;
    return req.post(fullUrl, body, { validateStatus: () => true, headers });
}
