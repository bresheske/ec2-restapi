const proc = require('child_process').exec;
const symbols = require('log-symbols');
const UI = require('console-ui');
const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
  writeLevel: 'INFO',
  ci: false
});

exports.execFn = (name, fn) => {
    ui.startProgress(name);
    return new Promise(async (res) => {
        try {
            const result = fn();
            if (result && result.then)
                result = await result;

            ui.stopProgress();
            ui.writeInfoLine(`${symbols.success} ${name}`);
            res(true);
        }
        catch (ex) {
            ui.stopProgress();
            ui.writeError(`${symbols.error} ${name}`);
            res(false);
        }
    });
}

exports.exec = (name, cmd) => {
    ui.startProgress(name);
    return new Promise((res) => {
        proc(cmd, (error, stdout, stderr) => {
            ui.stopProgress();
            const write = error
                ? () => ui.writeWarnLine(`${symbols.error} ${name}`)
                : () => ui.writeInfoLine(`${symbols.success} ${name}`);
            write();
            res(!error);
        });
    });
}