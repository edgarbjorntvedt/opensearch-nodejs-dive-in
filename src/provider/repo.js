
const LedgerRepo = require('../repo/LedgerRepo')

module.exports = (ioc) => {
    ioc.service(
        'LedgerRepo',
        (ioc) =>
            new LedgerRepo(
                ioc['ApiRequestFactory'],
                ioc['CONFIG']['API_LEDGER']
            )
    )
}
