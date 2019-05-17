import * as mysql from 'promise-mysql';
const config = require('../../config.json');

function getConnection() {
    return mysql.createConnection({
        host: config.auth.storage.host,
        user: config.auth.storage.user,
        password: config.auth.storage.pass,
        database: config.auth.storage.database
    });
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
            const value = typeof(v) === 'string'
                ? mysql.escape(`'${v}'`)
                : v;
            return { key: k, value: value };
        });
    const sql = `
        INSERT INTO ${table} (${keyValuePairs.map(p => p.key).join(',')})
        VALUES (${keyValuePairs.map(p => p.value).join(',')});
        SELECT LAST_INSERT_ID();
    `;
    const resp = await exec(sql);
    object.id = resp[0];
    return object;
}

export async function exec<T>(sql: string): Promise<T[]>{
    const con = await getConnection();
    const res: Promise<T[]> = await con.query(sql) as unknown as Promise<T[]>;
    await con.end();
    return res;
}
