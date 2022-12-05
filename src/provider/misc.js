module.exports = (ioc) => {
    ioc.service('Logger', (ioc) => {
        return require('@tfso/njs-logging').createLogger(
            ioc['CONFIG']['LOGGER']
        )
    })

    ioc.service('ApiRequestFactory', (ioc) => {
        const ApiRequestFactory = require('njs-tfso-request').ApiRequestFactory
        return new ApiRequestFactory(
            ioc['Logger'],
            'debug'
        )
    })
}
