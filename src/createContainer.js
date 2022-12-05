const path = require('path')
const fs = require('fs')
const Container = require('@tfso/njs-tfso-ioc')

module.exports = function () {
    const ioc = new Container()

    fs.readdirSync(path.join(__dirname, './provider')).forEach((filename) =>
        require(path.join(__dirname, './provider', filename))(ioc)
    )

    return ioc
}
