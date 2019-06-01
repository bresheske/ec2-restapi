import * as mysql from 'promise-mysql';
const config = require('../../environments/config.json');
import { getLogger } from "../utils/logger";
const logger = getLogger();

function getConnection() {
    return mysql.createConnection({
        host: config.storage.host,
        user: config.storage.user,
        password: config.storage.pass,
        database: config.storage.database,
        multipleStatements: true,
        timeout: 10000
    });
}

export function escape(text: string) {
    return mysql.escape(text);
}

export async function get<T>(id: number, table: string): Promise<T> {
    const sql = `
        SELECT *
        FROM ${table}
        WHERE id = ${id}
        LIMIT 1
    `;
    const resp: T[] = await exec(sql);
    return resp[0];
}

/**
 * creates a new row in any table. fully expects the object
 * to match the table schema, except for the id.
 * @param object object to create in the db
 */
export async function create(object: any, table: string) {
    if (object.id) {
        delete object.id;
    }
    const keyValuePairs = Object.keys(object)
        .map(k => {
            // if the value is a string type, we wrap it in single quotes.
            const key = k;
            const v = object[key];
            const value = escape(v);
            return { key: k, value: value };
        });
    const sql = `
        INSERT INTO ${table} (${keyValuePairs.map(p => p.key).join(',')})
        VALUES (${keyValuePairs.map(p => p.value).join(',')});
        SELECT LAST_INSERT_ID();
    `;
    const resp: any = await exec(sql);
    object.id = resp[0].insertId;
    return object;
}

export async function exec<T>(sql: string): Promise<T[]> {
    let con;
    try {
        con = await getConnection();
        logger.writeDebugLine(`mysql: executing: "${sql}"`);
        const res: T[] = await con.query(sql) as unknown as T[];
        await con.end();
        logger.writeDebugLine(`mysql: sql resulted in rows: ${res.length}`);
        return res;
    }
    catch (ex) {
        logger.writeError(ex);
        if (con) {
            await con.end();
        }
        throw(ex);
    }
}
