const mysql = require('promise-mysql');
const UI = require('console-ui');
const argv = require('yargs').argv;
const config = require('../environments/config.json');
const glob = require('glob');

const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
  writeLevel: 'INFO',
  ci: false
});

function getConnection() {
    const cfg = {
        host: config.storage.host,
        user: config.storage.user,
        password: config.storage.pass,
        database: config.storage.database
    };
    return mysql.createConnection(cfg);
}

async function exec(sql) {
    const con = await getConnection();
    try {
        const res = await con.query(sql);
        await con.end();
        return res;
    }
    catch(ex) {
        await con.end();
        throw(ex);
    }
}

async function migrateUp(migrations) {
    ui.writeInfoLine(`Migrations To Run: ${migrations.length}`);
    for (const m of migrations) {
        const jsM = require(`../src/migrations/${m}`);
        await jsM.up();
        const mId = m.split('_')[0];
        await exec(`
            INSERT INTO migration (file, migId)
            VALUES ('${m}', '${mId}')
        `);
        ui.writeInfoLine(`Migrated Up: ${m}`);
    }
}

async function migrateDown(migrations) {
    ui.writeInfoLine(`Migrations To Run: ${migrations.length}`);
    for (const m of migrations) {
        const jsM = require(`../src/migrations/${m}`);
        await jsM.down();
        const mId = m.split('_')[0];
        await exec(`
            DELETE FROM migration
            WHERE migId = '${mId}'
        `);
        ui.writeInfoLine(`Migrated Down: ${m}`);
    }
}

(async() => {
    // get our current migration
    let migId;
    try {
        const mig = await exec(`SELECT * FROM migration ORDER BY id DESC LIMIT 1`);
        if (mig.length > 0) {
            migId = mig[0].migId;
        }
    }
    catch(ex) {
        if (ex.code === 'ER_NO_SUCH_TABLE') {
            // the migration table doesn't exist, so lets create it now.
            ui.writeInfoLine(`no migration table, creating now.`);
            await exec(`
                CREATE TABLE migration (
                    id      INT             AUTO_INCREMENT,
                    file    VARCHAR(255),
                    migId   VARCHAR(14),
                    PRIMARY KEY (id)
                )
            `);
        }
        else {
            ui.writeError(ex);
            ui.writeError(`error while getting migrations from the database.`);
            return;
        }
    }

    // get a list of all of the migration files in src/migrations
    const files = glob.sync('./src/migrations/*.js')
        .map(f => f.split('/').pop())
        .sort((a, b) => {
            const aId = parseInt(a.split('_')[0]);
            const bId = parseInt(b.split('_')[0]);
            return aId > bId
                ? 1
            : bId > aId
                ? -1
            : 0;
        });

    const down = argv.down;

    // get the current index in the file[] of our current migration
    let currentIndex = -1;
    if (migId) {
        currentIndex = files.findIndex(f => f.split('_')[0] === migId);
    }

    // slice the array to only the migrations we need to execute.
    // if we're going up, it's the new stuff. if we're going down, it's everything to zero.
    const migrations = down
        ? files.slice(0, currentIndex + 1).reverse()
        : files.slice(currentIndex + 1);

    ui.writeInfoLine(`Current MySql Migration: ${migId || 'No current migration'}`);
    if (down)
        await migrateDown(migrations);
    else
        await migrateUp(migrations);
    
})();