
// get our current log level
const argv = require('yargs').argv;
const levels = [
    'DEBUG',
    'INFO',
    'WARNING',
    'ERROR'
];
let logLevel = argv.logLevel || argv.log || 'ERROR';
let ci = argv.ci || false;

// just a little validation.
if (!levels.includes(logLevel)) {
    console.log(`logger: log level ${logLevel} is not valid. must be one of ${JSON.stringify(levels)}.`);
    console.log(`logger: defaulting to 'ERROR'.`);
    logLevel = 'ERROR';
}

// init console UI
const UI = require('console-ui');
const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
  writeLevel: logLevel,
  ci: ci
});

/**
 * gets the usable logger.
 */
export function getLogger(): {
    writeDebugLine: (message: string) => void,
    writeInfoLine: (message: string) => void,
    writeWarnLine: (message: string) => void,
    writeError: (error: string | any) => void
} {
    return ui;
}