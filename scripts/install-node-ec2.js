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
        () => ui.writeInfoLine(`EC2 Setup For Node: ${env.name}`),
        () => ui.writeInfoLine(`Note: This only needs to be executed once per environment.`),
        () => utils.exec(`Installing NVM`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash ; source ~/.nvm/nvm.sh" > logs/install-nvm.log`),
        () => utils.exec(`Installing Node`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; nvm install node" > logs/install-node.log`),
        () => utils.exec(`Checking Node`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh; node -v" > logs/checking-node.log`),
    ];
    for (const step of steps) {
        const res = await step();
        if (res === false)
            break;
    }
})();