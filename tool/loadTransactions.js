const createSuite = require('./createSuite')
const moment = require('moment')
const fs = require('fs');

let jsonFileName = 'transactions.json'
let current = 0
let total = 0
const saveFunction = (transactions) => {
    current += transactions.length
    console.log(`Saving ${current} of ${total}`)
    fs.appendFileSync(jsonFileName, JSON.stringify(transactions) + ',')
}
const abortFunction = (to) => {
    total = to
    return false
}


async function main(){
    const suite = await createSuite()
    const ledgerRepo = suite['LedgerRepo']
    const customerId = '140'
    const identityId = '58f6b0e2-5fc7-45a2-a984-0d442a0a9d45'
    const clientId = '830155913062060'
    const userId = '96888'
    const crmType = 'customer'
    const openCloseType = 'all' // open|closed|all
    const since = null // moment('2000-01-01T00:00:00.000Z')
    const license = { clientId, identityId, userId }
    fs.writeFileSync(jsonFileName, '[')

    await ledgerRepo.getTransactions(customerId, crmType, openCloseType, since, license, abortFunction, saveFunction)

    fs.appendFileSync(jsonFileName, '{}]')
}

main()