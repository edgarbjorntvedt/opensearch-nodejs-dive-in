const {client, indexName, data, getClient} = require("./config");
const {logBody} = require("./helpers");
var chunk = require('lodash.chunk');

function getChunks(groups) {
    return chunk(groups, 500)
}

/**
 * Print a summary and view the first group
 * Format: action \n document \n action \n document ...
 * run-func index.js viewData
 */
module.exports.viewData = () => {
    const groups = Object.values(data.groups)
    const chunks = getChunks(groups)
    console.log('First group: ', JSON.stringify(groups[0], null, 4));
    console.log(`All data: ${groups.length} groups`);
    console.log(`${chunks.length} chunks`);
    console.log("first chunk is", JSON.stringify(chunks[0]).length, `bytes long`);
    console.log(`${chunks[0].length} chunk length`);
    console.log(`indexName: ${indexName}`);
};
/**
 * Testing async function
 * Format: action \n document \n action \n document ...
 * run-func index.js runAsync
 */
module.exports.runAsync = async () => {
    console.log('runAsync start');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('runAsync finished');
};
/**
 * Indexing data from json file with recipes.
 * Format: action \n document \n action \n document ...
 * run-func index.js injectData
 */
module.exports.injectData = () => {
    const groups = Object.values(data.groups)
    console.log(`Ingesting data: ${groups.length} groups`);
    const body = groups.map(doc => [
        {index: {_index: indexName}},
        doc,
    ]);

    client.bulk({refresh: true, body}, logBody);
};

/**
 * Indexing data from json file with recipes.
 * Format: action \n document \n action \n document ...
 * run-func index.js injectDataChunks
 */
module.exports.injectDataChunks = async () => {
    const groups = Object.values(data.groups)
    const chunks = getChunks(groups)
    const client = await getClient()
    // injest data in chunks
    chunks.forEach((chunk, index) => {
        console.log(`Ingesting data: ${chunk.length} groups`);
        const body = chunk.map(doc => [
            {index: {_index: indexName}},
            doc,
        ]);
        client.bulk({refresh: true, body}, logBody);
    })
};
/**
 * run-func index.js injectDataChunk_1
 */
module.exports.injectDataChunk_1 = async () => {
    const groups = Object.values(data.groups)
    const chunks = getChunks(groups)
    const client = await getClient()
    const chunk = chunks[0]
    // injest data
    console.log(`Ingesting data: ${chunk.length} groups`);
    const body = [
        {index: {_index: indexName}},
        chunk,
    ];
    client.bulk({refresh: true, body}, logBody);
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
module.exports.delete = (index) => {
    client.indices.delete(
        {
            index: index || indexName,
        },
        logBody
    );
};
