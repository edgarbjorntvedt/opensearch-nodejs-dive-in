const {getClient, indexName: index} = require("../config");
const {logAggs} = require("../helpers");

/**
 * run-func ledger/get.js search amount 0 periodDate 10 1
 */
module.exports.search = async (
    field,
    value = 0,
    sortField,
    pageSize = 10,
    page = 1,
    ) => {
    const from = (page - 1) * pageSize
    const size = pageSize

    const client = await getClient()
    const body = {
        // query: {
        //     match: {
        //         [field]: value,
        //     },
        // },
        sort: [
            {[sortField]: "asc"},
            {"_id": "asc"}
        ],
        aggs: {
            'link.id.value': { //aggs name
                terms: { // aggregation type
                    field: 'link.id.value',
                },
                aggs: {
                    'amount_sum': { //aggs name
                        sum: { // aggregation type
                            field: 'amount',
                        },
                    },
                    'amount_min': {
                        min: {
                            field: "amount"
                        }
                    },
                    'amount_max': {
                        max: {
                            field: "amount"
                        }
                    }
                },
            },
            // 'linkId_filter': {
            //     bucket_selector: {
            //         buckets_path: {
            //             'docCounts': 'type'
            //             // 'docCounts': 'link.id.value>doc_count'
            //         },
            //         'script': "docCounts > 2"
            //     }
            // }
        },
        // amount: {
        //     sum: {
        //         field: "amount"
        //     }
        // }
    };

    console.log(body, from, size,)
    try {
        const res = await client.search(
            {
                index,
                body,
                from, size,
                // size: 0, // we're not interested in `hits`
            },
        );
        const {aggregations} = res.body
        const {buckets} = aggregations['link.id.value']
        const {hits} = res.body.hits
        // .map((t) => [t.id.value, t.periodDate, t.amount, t.currency.id].join(' '))
        console.log({
            buckets,
            aggregations,
            hit1: hits.map(h => h._source)[0],
            bucket1: buckets[0],
            bucket2: buckets[1]
        })
    } catch (error){
        console.log(error)
    }

};