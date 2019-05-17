import { v4 } from 'uuid';
import * as hasher from '../auth/hash';
import * as mysql from '../storage/mysql';

export interface User {
    id: number;
    userName: string;
    password: string;
    salt: string;
}

export async function create(user: User): Promise<User> {
    user.salt = v4();
    user.password = hasher.hash(user.password, user.salt);
    await mysql.create(user, 'user');
    return user;
}