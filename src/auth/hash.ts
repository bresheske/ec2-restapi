import * as crypto from 'crypto';

export function hash(data: string, salt: string) {
    const hasher = crypto.createHash('sha512');
    hasher.update(data + salt);
    return hasher.digest('hex');
}