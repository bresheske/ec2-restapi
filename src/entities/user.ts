import { v4 } from 'uuid';
import * as hasher from '../auth/hash';
import * as mysql from '../storage/mysql';

export interface User {
    id: number;
    userName: string;
    password: string;
    salt: string;
    createdBy: string;
}

export enum RequestType {
    Create,
    Get,
    GetByUsernamePassword
}

const hiddenFields = [
    'password',
    'salt'
];

/**
 * removes secure fields before returning the object to the router, and then
 * eventually to the caller.
 * @param user user to be returned
 */
function clean(user: User): User {
    for (const h of hiddenFields) {
         // @ts-ignore
        delete user[h];
    }
    return user;
};

export async function create(user: User): Promise<User> {
    user.salt = v4();
    user.password = hasher.hash(user.password, user.salt);
    await mysql.create(user, 'user');
    return clean(user);
}

export async function get(id: number): Promise<User> {
    const user = await mysql.get<User>(id, 'user');
    return clean(user);
}

export async function getByUsernamePassword(username: string, password: string): Promise<User | null> {
    // first get our user by our username.
    const users = await mysql.exec<User>(`
        SELECT *
        FROM user
        WHERE userName = ${mysql.escape(username)}
        LIMIT 1
    `);
    if (!users || users.length !== 1) {
        return null;
    }
    const user = users[0];

    // now we can validate it against the password & salt.
    const hashedPassword = hasher.hash(password, user.salt);
    if (user.password !== hashedPassword) {
        return null;
    }

    return clean(user);
}

export function validate(user: User, type: RequestType): boolean {

    if (type === RequestType.Create) {
        return user
            && !!user.userName
            && !!user.password
            && !!user.createdBy;
    }
    else if (type === RequestType.Get) {
        return user
            && !!user.id;
    }
    else if (type === RequestType.GetByUsernamePassword) {
        return user
            && !!user.userName
            && !!user.password;
    }

    return false;
}