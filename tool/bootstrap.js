const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// Try to require all the things asap so its done before tests
require('../src/createContainer')()
