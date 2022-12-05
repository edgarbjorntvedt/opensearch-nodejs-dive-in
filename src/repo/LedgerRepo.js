const moment = require('moment')

const odataEscapeStr = (str) => {
    str = '' + str
    return str.replace("'", "''")
}
class LedgerRepo {
    /**
     * @param {ApiRequestFactory} api
     * @param {CONFIG} config
     */
    constructor(api, config) {
        this._api = api
        this._apiProtocol = config.protocol
        this._apiHost = config.host
        this._apiPort = config.port
    }

    _getConnection(path, method) {
        return {
            protocol: this._apiProtocol,
            hostname: this._apiHost,
            port: this._apiPort,
            path: path,
            method: method,
        }
    }

    /**
     * @param license
     * @param isAborted
     * @returns {Promise<GLLine[]>}
     */
    async getTransactions(customerId, crmType, openCloseType, since,
        license,
        isAborted = (totalNumberOfTransactions) => false,
        saveFunction = null
    ) {
        const startingDate = '2000-01-01'
        const endingDate = '2040-01-01'

        const odataFilter = this._getAllTransactionsfilter(customerId, crmType, openCloseType, since)

        // const glAccount = (crmType === 'customer') ? '1500' : '2400'
        // const odataFilter = [`(account/no eq '${glAccount}')`].join(' ')
        // const odataFilter = [``].join(' ')

        let transactions = []
        let page = 1
        let hasMoreItems = true
        let total = null
        while (hasMoreItems && !isAborted(total)) {
            const response = await this._api.doRequest(
                this._getConnection('/transactions', 'GET'),
                {
                    query: {
                        $filter: odataFilter,
                        limit: 100,
                        page,
                        // excludeDimensions: 'true',
                        startingDate,
                        endingDate: endingDate // moment(endingDate).endOf('day').toDate(),
                    },
                    license,
                    headers: { Accept: 'application/hal+json' },
                }
            )
            total = response.total || null
            if (saveFunction){
                saveFunction(response._embedded.transactions)
            } else {
                transactions = [...transactions, ...response._embedded.transactions]
            }
            page++
            hasMoreItems = !!(response._links && response._links.next)
        }
        return transactions
    }

    _getAllTransactionsfilter(customerId, crmType, openCloseType, since=null){
        return this._getCrmIdPart(customerId)+
            this._getLedgerTypePart(crmType)+
            this._getOpenClosePart(openCloseType)+
            this._getSincePart(since)
    }

    _getSincePart(since=null){
        if (!since)
        return ''

        const sinceString = (typeof (since) === 'string') ? since : since.toISOString()

        return ' and (createdAt gt '+sinceString+')'
    }

    _getOpenClosePart(type){
        if (type === 'close')
            return ' and link/isOpen eq 0'
        if (type === 'open')
            return ' and link/isOpen eq 1'

        return ''
    }

    _getLedgerTypePart(ledgerType){
        if (ledgerType === 'customer')
            return ' and (account/no ge 1500 and account/no le 1529)'
        else
            return ' and (account/no ge 2400 and account/no le 2429)'
    }

    _getCrmIdPart(customerId){
        return '(customerId eq '+customerId+')'
    }
}

module.exports = LedgerRepo
