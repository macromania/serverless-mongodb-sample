const queryService = require('./service/query-service');

exports.handler = async (event) => {
    console.log(`Request:: ${JSON.stringify(event, null, 2)}`);

    let statusCode;
    let result;
    let error;
    const requestId = event.requestContext.requestId;
    const { stringKey, numberKey, booleanKey } = event.requestContext.authorizer;

    const dbName = await queryService.getDbName();

    try {
        // TODO: Query Db, run operations
        statusCode = 200;
        result = {
            db: dbName,
        };
    } catch (e) {
        statusCode = 400;
        error = {
            message: e.message,
        };
    }

    const response = {
        statusCode,
        body: JSON.stringify({
            status: statusCode === 200 ? 'success' : 'error',
            result,
            error,
            requestId,
            authContext: {
                stringKey,
                numberKey,
                booleanKey,
            },
        }),
    };

    console.info(`Response:: ${JSON.stringify(response, null, 2)}`);
    return response;
};
