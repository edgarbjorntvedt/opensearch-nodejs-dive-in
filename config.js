require("dotenv").config();

const { Client, Connection } = require("@opensearch-project/opensearch");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const aws4 = require("aws4");

module.exports.indexName = process.env.DATA_FILE.replace('.json', '');

// kunde.140.json taken from
// https://drive.google.com/file/d/1sN1-pvw2knc4uadq4kPjH1V60UpnYbdX/view
module.exports.data = require("./"+process.env.DATA_FILE);

/**
 * Client performs requests on our behalf
 * Additionally, when creating a client you can also specify `ssl configuration`,
 * `bearer token`, `CA fingerprint` and other authentication details depending on protocols you use.
 */
module.exports.client = new Client({
    node: process.env.SERVICE_URI,
});


const createAwsConnector = (credentials, region) => {
    class AmazonConnection extends Connection {
        buildRequestObject(params) {
            const request = super.buildRequestObject(params);
            request.service = 'es';
            request.region = region;
            request.headers = request.headers || { Authorization: "Basic adminUser 9677dd8e-e784-c1b6-3748-a2425f3d5ceb@Q"};
            request.headers['host'] = request.hostname;

            return aws4.sign(request, credentials);
        }
    }
    return {
        Connection: AmazonConnection
    };
};

module.exports.getClient = async () => {
    const credentials = await defaultProvider()();
    return new Client({
        ...createAwsConnector(credentials, process.env.AWS_REGION),
        // auth:{
        //     username: 'adminUser',
        //     password: '9677dd8e-e784-c1b6-3748-a2425f3d5ceb@Q'
        // },
        node: process.env.SERVICE_URI,
        //node: host,
    });
}
// console.log(process.env.SERVICE_URI)