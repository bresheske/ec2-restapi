import * as mysql from '../storage/mysql';

export async function up() {
    await mysql.exec(`
        CREATE TABLE user (
            id          INT             AUTO_INCREMENT,
            userName    VARCHAR(255),
            password    VARCHAR(255),
            salt        VARCHAR(36),
            createdBy   VARCHAR(255),
            PRIMARY KEY (id)
        )
    `);
}

export async function down() {
    await mysql.exec(`
        DROP TABLE user
    `);
}