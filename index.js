const {client, indexName, data, getClient} = require("./config");
const {logBody} = require("./helpers");
var chunk = require('lodash.chunk');

function getChunks(groups) {
    return chunk(groups, 200)
}

/**
 * Print a summary and view the first group
 * Format: action \n document \n action \n document ...
 * run-func index.js viewData
 */
module.exports.viewData = () => {
    const groups = data.flatMap(a=>a)
    const chunks = getChunks(groups)
    console.log('First group: ', JSON.stringify(groups[0], null, 4));
    console.log(`All data: ${groups.length} groups`);
    console.log(`${chunks.length} chunks`);
    console.log("first chunk is", JSON.stringify(chunks[0]).length, `bytes long`);
    console.log(`${chunks[0].length} chunk length`);
    console.log(`indexName: ${indexName}`);
    console.log(`no id.value: ${groups.filter(g => !g.id.value).length} id.value: ${groups.filter(g => g.id.value).length}`);
};
/**
 * Indexing data from json file with recipes.
 * Format: action \n document \n action \n document ...
 * run-func index.js injectData
 */
module.exports.injectData = async () => {
    // const groups = Object.values(data.groups)
    const groups = data.flatMap(a=>a)
    const client = await getClient()
    console.log(`Ingesting data: ${groups.length} groups`);
    const body = groups.flatMap(doc => [
        {index: {_index: indexName, _id: doc.id && doc.id.value}},
        doc,
    ]);

    client.bulk({body}, logBody);
};

/**
 * Indexing data from json file with recipes.
 * Format: action \n document \n action \n document ...
 * run-func index.js injectDataChunks
 */
module.exports.injectDataChunks = async () => {
    // const groups = Object.values(data.groups)
    const groups = data.flatMap(a=>a)
    const chunks = getChunks(groups)
    const client = await getClient()
    let i=0
    console.log('inserting', chunks.length , 'chunks')
    for (const chunk of chunks) {
        const body = chunk.flatMap(doc => [
            {index: {_index: indexName, _id: doc.id && doc.id.value}},
            doc,
        ]);
        const res = await client.bulk({ body});
        const {errors, took, items} = res.body
        console.log(JSON.stringify({i:++i, errors, took, items:items.length}))
    }
};
/**
 * run-func index.js injectDataChunkId 0
 */
module.exports.injectDataChunkId = async (index) => {
    // const groups = Object.values(data.groups)
    const groups = data.flatMap(a=>a)
    const chunks = getChunks(groups)
    const client = await getClient()
    const chunk = chunks[parseInt(index)]
    // injest data
    console.log(`Ingesting chunk: ${index}`);
    const body = chunk.flatMap(doc => [
        {index: {_index: indexName, _id: doc.id && doc.id.value}},
        doc,
    ]);
    console.log('starting bulk')
    const res = await client.bulk({refresh: true, body});
    const {errors, took, items} = res.body
    console.log(JSON.stringify({i:index, errors, took, items:items.length}))
};

/**
 * Getting list of indices
 * run-func index.js getIndices
 */
module.exports.getIndices = async () => {
    console.log(`Getting existing indices:`);
    const client = await getClient()

    client.cat.indices({format: "json"}, logBody);
};

/**
 * print key
 * run-func index.js aws
 */
module.exports.awskey = async () => {
    console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID}`);
    const client = await getClient()
};

/**
 * Retrieving mapping for the index.
 * run-func index.js getMapping
 */
module.exports.getMapping = async () => {
    const client = await getClient()
    console.log(`Retrieving mapping for the index with name ${indexName}`);

    client.indices.getMapping({index: indexName}, (error, result) => {
        if (error) {
            console.error(error);
        } else {
            // console.log(result.body);
            console.log(result.body[indexName].mappings.properties);
        }
    });
};

/**
 * Deleting the index
 * run-func index.js delete
 */
module.exports.delete = async (index) => {
    const client = await getClient()
    client.indices.delete(
        {
            index: index || indexName,
        },
        logBody
    );
};
