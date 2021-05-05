const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('The MONGODB_URI environment variable must be configured with the connection string to the database.');
}

let cachedPromise = null;
module.exports.connectToDatabase = async function connectToDatabase() {
    if (!cachedPromise) {
        /**
         * We cache the promise instead of the connection itself to prevent race conditions where connect is called more than once.
         * The promise will resolve only once.
         * Node.js driver docs can be found at http://mongodb.github.io/node-mongodb-native/
         */
        cachedPromise = MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    // This resolves only once.
    const client = await cachedPromise;
    return client;
};
