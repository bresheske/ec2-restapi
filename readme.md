# To Run Development
```
npm i
npm start
```

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