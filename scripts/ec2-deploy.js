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

// load in our configuration file
const env = require(`../environments/config.json`);

// everything looks good, now we want to execute our steps.
// special note - mysql seems to break after webpacking with minify. 
//   so we're using dev mode '-d'.
(async() => {
    const steps = [
        () => ui.writeInfoLine(`EC2 Deployment: ${env.name}`),
        () => utils.exec(`Building Typescript`, `npx tsc > logs/tsc.log`),
        () => utils.exec(`Packaging Deployment`, `npx webpack ./src/main.js -o ./dist/main.js --target node -d > logs/pack.log`),
        () => utils.exec(`Deploying Files`, `scp -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} -r ./dist ${env.user}@${env.location}: > logs/files.log`),
        () => utils.exec(`Deploying Signing Keys`, `scp -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} -r ./signingkeys ${env.user}@${env.location}:dist > logs/signingKeys.log`),
        () => utils.exec(`Deploying Application`, `ssh -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; cd ./dist ; npx pm2 reload main.js" > logs/app.log`),
    ];
    for (const step of steps) {
        const res = await step();
        if (res === false)
            break;
    }
})();