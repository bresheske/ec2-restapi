import * as axios from 'axios';
import { getEnvironment } from './environment';
const req = axios.default;
const env = getEnvironment();

export function get(url: string): axios.AxiosPromise {
    const fullUrl = env.protocol + '://' + env.location + ':' + env.port + url;
    console.log(`request.get: ${fullUrl}`);
    return req.get(fullUrl);
}
