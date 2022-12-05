require('./bootstrap')
const createContainer = require('../src/createContainer')

async function createSuite() {
    const suite = createContainer()
    return suite
}

module.exports = createSuite
