const env = require('getenv')

module.exports = (ioc) => {
    ioc.service('CONFIG', (ioc) => {
        const host = env.string(
            'HOST',
            'demo'
        )
        const nodeEnv = env.string('NODE_ENV', 'production')

        return {
            NODE_ENV: nodeEnv,
            LOGGER: {
                NODE_ENV: nodeEnv,
                HOST: host,
                LOG_LEVEL: env.string('LOG_LEVEL', 'warn'),
                LOG_LEVEL_CONSOLE: env.string('LOG_LEVEL_CONSOLE', 'info'),
                LOG_LEVEL_SPLUNK: env.string('LOG_LEVEL_SPLUNK', 'info'),
                LOG_TO_CONSOLE: env.boolish('LOG_TO_CONSOLE', true),
                LOG_TO_SPLUNK: env.boolish('LOG_TO_SPLUNK', true),
                LOG_CLEAN_CONSOLE: env.boolish('LOG_CLEAN_CONSOLE', true),
                LOG_PERFORMANCE: env.boolish('LOG_PERFORMANCE', false),
                LOG_SCRUB_HEADERS: env.array('LOG_SCRUB_HEADERS', 'string', [
                    'cookie',
                    'authorization',
                ]),
                LOG_SCRUB_BODY: env.boolish('LOG_SCRUB_BODY', true),
                SPLUNK_TOKEN: env.string('SPLUNK_TOKEN', ''),
                SPLUNK_URL: env.string('SPLUNK_URL', ''),
            },
            API_LEDGER: {
                host: env.string(
                    'API_LEDGER_HOST',
                    'generalledger-3b.api.24sevenoffice.com'
                ),
                port: env.string('API_LEDGER_PORT', 80),
                protocol: env.string('API_LEDGER_PROTOCOL', 'http:'),
            },
        }
    })
}
