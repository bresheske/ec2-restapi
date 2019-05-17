export interface Environment {
    name: string;
    location: string;
    protocol: string;
    port: string;
};

export function getEnvironment(): Environment {
    let envArg = process.env.JEST_ENV;
    if (!envArg) {
        throw new Error(`Environment variable 'JEST_ENV' is not set.`);
    }

    envArg = envArg.trim();

    const config = require('../../config.json');
    const env = config.environments.find( (e:Environment) => e.name === envArg);
    if (!env) {
        throw new Error(`Environment variable 'JEST_ENV' is set to '${envArg}', which does not match any known environments.`);
    }

    const res = {
        ...env,
        port: config.port
    };
    return res;
}