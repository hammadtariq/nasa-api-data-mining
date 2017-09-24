import fs = require('fs');

const _instance = Symbol();

export default class Config {

    private config: Object;

    static get instance(): Config {
        return this[_instance] || (this[_instance] = new Config(_instance));
    }

    private constructor(singletonToken) {
        if (singletonToken !== _instance) {
            throw new Error("Cannot instantiate directly.");
        }

        const environment: string = process.env.TEST_ENVIRONMENT;

        const envFile = require('path').join(__dirname, `../../config/${environment}.env.json`);

        let env: Object = {};

        if (fs.statSync(envFile)) {
            var envData = fs.readFileSync(envFile, 'utf-8');
            try {
                env = JSON.parse(envData);
            }
            catch (e) {
                throw new Error(`Failed to parse configuration file ${environment}`);
            }
        }
        else {
            throw new Error(`Missing configuration file for environment ${environment}`);
        }

        this.config = Object.assign({}, {
            // Debug
            "debug": env["debug"],

            // Application Port
            "api": env["api"],

            // Mongo
            "mongoUri": env["mongoUri"], // || throw new ConfigurationError("Missing configuration entry for MongoDB"),

        });
    }

    get debug() { return this.getProperty("debug"); }
    get apiPort() { return this.getProperty("api")["port"]; }
    get databaseUrl(): string { return this.getProperty("mongoUri"); }

    public getProperty(name: string) {
        return this.config[name];
    }
}
