const utils = require('./deployUtils');

const UI = require('console-ui');
const argv = require('yargs').argv;
const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
  writeLevel: 'INFO',
  ci: false
});

// first validate our input a little
const envArg =
    argv.environment
    || argv.env
    || argv.e;
if (!envArg) {
    ui.writeError(`Error: Required flag [ environment | env | e ] is missing.`);
    return;
}

// find the environment in the config map.
const config = require('../config.json');
const env = config.environments.find(e => e.name === envArg);
if (!env) {
    ui.writeError(`Error: Could not find environment in config.json matching name '${envArg}'.`);
    return;
}

// everything looks good, now we want to execute our steps.
(async() => {
    const steps = [
        () => ui.writeInfoLine(`EC2 Deployment: ${env.name}`),
        () => utils.exec(`Building Typescript`, `npx tsc > logs/tsc.log`),
        () => utils.exec(`Packaging Deployment`, `npx webpack ./src/main.js -o ./dist/main.js --target node --mode production > logs/pack.log`),
        () => utils.exec(`Deploying Files`, `scp -i ./pemfiles/${env.pemfile} -r ./dist ${env.user}@${env.location}: > logs/files.log`),
        () => utils.exec(`Deploying Application`, `ssh -i ./pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; cd ./dist ; npm i forever ; npx forever stopall ; npx forever start main.js" > logs/app.log`),
    ];
    for (const step of steps) {
        const res = await step();
        if (res === false)
            break;
    }
})();