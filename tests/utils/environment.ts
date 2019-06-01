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

    const config = require(`../../environments/config.${envArg}.json`);

    return config;
}