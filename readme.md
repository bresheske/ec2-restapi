# EC2-RestAPI
This is a template for architecture in which an express RestAPI could be developed locally and deployed
out to any SSH-enabled server. In this case, an AWS EC2 instance running Ubuntu.

# Features
   - Easy local development
   - Easy server initialization
   - Easy server deploys
   - Easy database migrations
   - MySQL integration
   - Authorization using JSON web tokens
   - Unit test execution
   - Integration test execution
   - Verbosity-based logging
   - Multiple environment configuration
   - Zero downtime deployments
   - Auto rotating of server log files
   - Easy load-balancing options

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
npm run test:unit
```
You'll need to actually start the application locally to start the local environment tests. 
These are executed using jest, and are located in the tests folder.

# To Deploy

## Deploying the First Time
   - **Requirement:** OpenSSH installed locally
   - Create an EC2 instance in AWS.
      - Remember to allow inbound access to port 8000 (or your configured port) in your security group.
      - Download the PEM file from aws, and copy it into your pemfiles directory.
      - **Special Note**: OpenSSH will fail if permissions on your PEM file are not set appropriately. To test your permissions, you may run the `npm run ssh` script found in the `package.json` file.  You only need to change the server location.
   - Alter the `environments/config.d1.json` file. You should only need to change the server location (and make sure the pemfile is named correctly).
   - Run `npm run configure:d1`.  This does quite a number of things, and will give you status updates along the way.

## Subsequent Deploys
All you need to run is `npm run deploy:d1` (or change your configured environments). This will transpile, pack, copy files, and reload your service with zero downtime.

## How does it work?
EC2 is just another VM, so you get control over a system to perform computations. Our NodeJS application is a stand-alone javascript executable that needs to be told when to run.  We do this with [PM2](https://pm2.io/doc/en/runtime/overview). 

You may dig deeper into the [configure script](./scripts/ec2-configure.js) to see exactly how PM2 is used to control execution.

## Processor Load-Balancing
Since we're using PM2, it's easy to spin up multiple instances for a single EC2 instance if we're using a multi-core processor. Just see the [PM2 docs](https://pm2.io/doc/en/runtime/guide/load-balancing/) and slightly alter the configure script to run what you need. *Note*: In AWS, multi-core configurations are not supported under the free-tier. You have to pay for them.

# To Run Migrations
Make sure your `config.json` file contains your database connection settings. Then the following commands are available:
 ```
 npm run migrate:up:d1
 npm run migrate:down:d1
 ```

This works by first creating or querying a table called 'migration' to understand which migration we're currently on, then will compare that to the files located in `/src/migrations`, then will execute the migrations that come after our current migration. Migrating down will migrate all the way down until your database is clean.

# But Why?
Valid question. AWS has API Gateway + Lambda to execute simple functions through HTTP(S) calls.  Why would we ever go back to the "good old days" of controlling full servers (or VMs) to execute our deployables? 

### **Point 1**: Scalability
AWS Lambda was designed to be scalable, but in reality I have seen everything to the contrary.  Say you have a large application, maybe 1k lambdas in total, and each lambda has the ability to call other lambdas and await on their results.  You'll reach the maximum number of concurrent lambdas in AWS very quickly, and AWS will start doing something called "throttling".  This means, one or a couple out of the thousand you need to execute will actually just get dropped, leaving you with incomplete execution of business logic.  This leads to massive data integrity issues and very-difficult-to-trace bugs being reported, as there's no logs generated. Using EC2, you can scale up your instances automatically with elastic beanstalk, if you were inclined. Additionally, you can purchase stronger VMs or even dedicated servers. Remember, you're developing for a server, so you don't even actually have to use AWS if you don't want too. 

### **Point 2**: Development Experience
Have you ever dev-tested your serverless lambda code locally before pushing it out to an AWS environment (or perhaps out to QA, where you could be affecting the work of others)? In simple applications, you can use [serverless-offline](https://github.com/dherault/serverless-offline) which will read your YML files and, with little configuration, will execute them for you.  However, when you start utilizing other AWS features (like S3, or Firehose, or direct lambda-to-lambda, or ...) you need to basically find a plugin to override the calls to those other features and hit something that mimics those features locally instead.  You find yourself writing lots of code thats very specific to a particular environment, which results in 'zombie' code when deploying out to AWS.  

**TL;DR** - I have found maintaining serverless-offine development to be extremely difficult for larger applications (but totally worth it, if AWS lambda is your choice).

In my view, what makes an architecture **great** is simply just the following:
 - **It's easy to maintain**: Meaning it's easy for developers to edit code and, more importantly, test it before impacting others and, most importantly, allows developers to take pride in their work before showing alpha bug-ridden code to their team.
 - **It's easy to deploy**: Meaning you only need to run 1 script or push 1 button to get your latest code out to a test-ready environment. This also opens the doors to a very positive full CI/CD cycle.

### **Point 3**: Flexibility
AWS is not the only provider out there when it comes to hosting servers or VMs.  If you develop your code as a simple stand-alone rest service, or set of services, you're never married to AWS.  You can choose to use AWS today, and choose Azure tomorrow if you want.  That's totally fine, and you can work with whatever works best for you.  Unfortunately, AWS lambda is the exact opposite.  You're defining your architecture completely specific to AWS's features and you're forced into it from here on out.  AWS has some really neat features, arguably, but it's a pretty bold decision in my opinion.

### **Point 4**: "Serverless" isn't _really_ Serverless
One of the main arguments for a serverless architecture (like AWS lambda) is that you no longer need to worry about any server-maintenance woes.  I have found this is not at all true. It really just pushes the problem if server maintenance to another location. With native AWS, you still need to:
 - Tune your AWS lambdas to ensure no single one will consume all of your concurrent lambda executions. 
 - Likely hook up your lambdas to SQS, so that when your lambdas get throttled, you don't lose the request. But this means you also need to tune your awake and visibility times and _literally wait hours_ for all of your requests to finish, as a number if them will timeout.
 - Manage the load of your cloudwatch logs, which increases budget.
 - Manage the total load of your concurrent lambdas, which increases budget.
 - Utilize S3 for any file-based needs you might have, which increases budget.
 - Utilize AWS firehose for any file-appending you might need, as S3 simply doesn't support it. It is still a mystery to me as to why AWS never thought this was an important feature. This also increases budget.
 - Utilize SNS for allowing S3, SQS, and Lambda to actually communicate with each other. This increases budget.
 - As part of all of the communication mentioned above, maintain IAM credentials (permissions, groups, roles) for all of it. This increases budget.

 For any regular application need, you're looking at utilizing 5+ native AWS features (which again, see point #2 about how difficult it gets to maintain development experience) which is really only easiely tested in an actual AWS environment. These features are pretty neat, but you're absolutely cornering yourself into a particular architecture that you're going to have to use forever. Let us just hope that AWS remains affordable _forever_. 

### **Point 5**: YML
This point is pretty subjective.  As a developer, I **_hate_** maintaining YML files that define how my serverless architecture should behave.  There's no YML definition, no intelliscence, and nothing preventing me from creating a copy-paste typo. Additionally, developers can't test their YML "code" until they're ready to deploy out their packages to AWS.  Again, see point 2 as to how this can interfere with other members of your team. With EC2, there's no YML and no reason why you cannot run everything locally before deployments.
