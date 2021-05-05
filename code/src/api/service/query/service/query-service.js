const { connectToDatabase } = require('../repository/db-connection');

const getDbName = async () => {
    const client = await connectToDatabase();
    const dbName = client.db().databaseName;
    return dbName;
};

module.exports = {
    getDbName,
};
