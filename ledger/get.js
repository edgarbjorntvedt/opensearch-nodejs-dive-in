const {getClient, indexName: index} = require("../config");
const {logAggs} = require("../helpers");

/**
 * run-func ledger/get.js search amount 0 10 1 currency.id
 */
module.exports.search = async (
    field,
    value = 0,
    pageSize = 10,
    page = 1,
    sortField) => {
    const from = (page - 1) * pageSize
    const size = pageSize
    // console.log({field, value, pageSize, page, from, size})

    const client = await getClient()
    const body = {
        query: {
            match: {
                [field]: value,
            },
        },
        sort: [
            {[sortField]: "asc"},
            {"_id": "asc"}
        ]
        // try mixing with search queries!
        // query: {
        //     match: {
        //         [matchField]: matchValue
        //     }
        // },
    };
    console.log(body)
    const res = await client.search(
        {
            index,
            body,

            from, size,
            // size: 0, // we're not interested in `hits`
        },
    );
    let data = res.body.hits.hits
        .map(h => h._source)
        .map((t) => [t.id.value, t.periodDate, t.amount, t.currency.id].join(' '))
    console.log(data)
};