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
(async() => {
    const steps = [
        () => ui.writeInfoLine(`EC2 Setup For Node: ${env.name}`),
        () => ui.writeInfoLine(`Note: This only needs to be executed once per environment.`),
        () => utils.exec(`Building Typescript`, `npx tsc > logs/tsc.log`),
        () => utils.exec(`Packaging Deployment`, `npx webpack ./src/main.js -o ./dist/main.js --target node -d > logs/pack.log`),
        () => utils.exec(`Deploying Files`, `scp -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} -r ./dist ${env.user}@${env.location}: > logs/files.log`),
        () => utils.exec(`Deploying Signing Keys`, `scp -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} -r ./signingkeys ${env.user}@${env.location}:dist > logs/signingKeys.log`),
        () => utils.exec(`Installing NVM`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash ; source ~/.nvm/nvm.sh" > logs/install-nvm.log`),
        () => utils.exec(`Installing Node`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; nvm install node" > logs/install-node.log`),
        () => utils.exec(`Checking Node`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh; node -v" > logs/checking-node.log`),
        () => utils.exec(`Installing PM2 & LogRotate`, `ssh -o StrictHostKeyChecking=no -i pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh; cd ./dist ; npm i pm2 ; npx pm2 install pm2-logrotate ;" > logs/install-pm2.log`),
        () => utils.exec(`Deploying Application`, `ssh -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; cd ./dist ; npx pm2 start main.js" > logs/start-pm2.log`),
        () => utils.exec(`Configuring Startup Script`, `ssh -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; cd ./dist ; sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v12.4.0/bin /home/ubuntu/dist/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu" > logs/startup-pm2.log`),
        () => utils.exec(`Saving PM2 Configuration`, `ssh -o StrictHostKeyChecking=no -i ./pemfiles/${env.pemfile} ${env.user}@${env.location} ". ~/.bashrc ; source ~/.nvm/nvm.sh ; cd ./dist ; npx pm2 save" > logs/save-pm2.log`),

    ];
    for (const step of steps) {
        const res = await step();
        if (res === false)
            break;
    }
})();