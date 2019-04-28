# To Run Development
```bash
npm i
npm start
```

This will start up the application, a watcher for auto-transpilation, and a watcher to auto-restart the application after transpilation. All you need to do is save a file and the application will reboot with your latest changes.

# To Execute Tests
```bash
npm run test:local
npm run test:d1
```
You'll need to actually start the application locally to start the local environment tests. 
These are executed using jest, and are located in the tests folder.

# To Deploy

### Deploying the First Time
 - **Requirement:** OpenSSH installed locally
 - Create an EC2 instance in AWS.
    - Remember to allow inbound access to port 8000 (or your configured port) in your security group.
    - Download the PEM file from aws, and copy it into your pemfiles directory.
 - Alter the `config.json` file. You should only need to change the server location (and make sure the pemfile is named correctly).
 - Run `npm run configure:d1`. This will install NVM and Node on your new EC2 instance.
 - Run `npm run deploy:d1`. This will deploy your nodejs application.

### Subsequent Deploys
All you need to run is `npm run deploy:d1` (or change your configured environments). This will transpile, pack, copy files, and launch your service.

### How does it work?
EC2 is just another VM, so you get control over a system to perform computations. Our NodeJS application is a stand-alone javascript executable that needs to be told when to run.  We do this with [forever](https://www.npmjs.com/package/forever). Looking deeper into the deployment logic:
 - First we copy all of the files with `scp -i ./pemfiles/${env.pemfile} -r ./dist ${env.user}@${env.location}: > logs/files.log`.  This is an SSH-file copy script.
 - Then, we stop and restart the node executable like so:
   - `. ~/.bashrc`
   - `source ~/.nvm/nvm.sh`
   - `cd ./dist`
   - `npm i forever`
   - `npx forever stopall`
   - `npx forever start main.js`
- So we're actually installing 'forever' in our distributable directory alongside of the webpacked main.js file. 