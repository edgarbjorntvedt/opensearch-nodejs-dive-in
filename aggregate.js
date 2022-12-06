const { client, getClient, indexName: index } = require("./config");
const { logAggs } = require("./helpers");

/**
 * Get metric aggregations for the field
 * Examples: stats, extended_stats, percentiles, terms
 * run-func aggregate.js metric avg amount
 * run-func aggregate.js metric stats amount
 * run-func aggregate.js metric terms link.id
 * run-func aggregate.js metric stats account.no
 * run-func aggregate.js metric stats invoiceDueDate
 * run-func aggregate.js metric extended_stats amount
 * run-func aggregate.js metric percentiles amount
 */
module.exports.metric = async (metric, field) => {
  const client = await getClient()
  const body = {
    aggs: {
      [`aggs-for-${field}`]: { //aggs name
        [metric]: { // aggregation type
          field,
        },
      },
    },
    // try mixing with search queries!
    // query: {
    //     match: {
    //         [matchField]: matchValue
    //     }
    // },
  };
  client.search(
    {
      index,
      body,
      size: 0, // we're not interested in `hits`
    },
    logAggs.bind(this, `aggs-for-${field}`)
  );
};

/**
 * Histogram with interval
 * run-func aggregate.js histogram amount 100
 * run-func aggregate.js histogram voucher.no 1000
 */
module.exports.histogram = async (field, interval) => {
  const client = await getClient()
  const body = {
    aggs: {
      [`aggs-for-${field}`]: {
        histogram: { // aggregation type
          field,
          interval,
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `aggs-for-${field}`)
  );
};

/**
 * Date histogram with interval
 * run-func aggregate.js dateHistogram periodDate year
 * run-func aggregate.js dateHistogram periodDate month
 */
module.exports.dateHistogram = async (field, interval) => {
  const client = await getClient()
  const body = {
    aggs: {
      [`aggs-for-${field}`]: {
        date_histogram: {
          field,
          interval,
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `aggs-for-${field}`)
  );
};

/**
 * Date histogram with number of buckets
 * run-func aggregate.js autoDateHistogram periodDate 3
 */
module.exports.autoDateHistogram = async (field, buckets) => {
  const client = await getClient()
  const body = {
    aggs: {
      [`aggs-for-${field}`]: {
        auto_date_histogram: {
          field,
          buckets,
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `aggs-for-${field}`)
  );
};


/**
 * Calculating the moving average of number of added recipes across years
 * run-func aggregate.js movingAverage
 */
module.exports.movingAverage = async () => {
  const client = await getClient()
  const body = {
    aggs: {
      recipes_per_year: { // 1. date histogram
        date_histogram: {
          field: "date",
          interval: "year",
        },
        aggs: {
          recipes_count: { // 2. metric aggregation to count new recipes
            value_count: { // aggregate by number of documents with field 'date'
              field: "date"
            },
          },
          moving_average: {
            moving_fn: { // 3. glue the aggregations
              script: "MovingFunctions.unweightedAvg(values)", // 4. a built-in function
              shift: 1, // 5. take into account the existing year as part of the window
              window: 3, // 6. set size of the moving window
              buckets_path: "recipes_count",
              gap_policy: "insert_zeros", // account for years where no recipes were
                                          // added and replace null value with zeros
            },
          },
        },
      },
    },
  };
  client.search(
      {
        index,
        body,
        size: 0,
      },
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.log(result.body.aggregations["recipes_per_year"].buckets);
        }
      }
  );
};