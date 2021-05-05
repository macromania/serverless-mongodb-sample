function generatePolicy(principalId, effect, resource) {
    const authResponse = {};
    authResponse.principalId = principalId;

    if (effect && resource) {
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [],
        };

        const executeApiStatemet = {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
        };

        policyDocument.Statement[0] = executeApiStatemet;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        stringKey: 'stringval',
        numberKey: 123,
        booleanKey: true,
    };

    console.log(`Generated Policy:: ${JSON.stringify(authResponse, null, 2)}`);

    return authResponse;
}

exports.handler = async (event, context, callback) => {
    console.log(`Request:: ${JSON.stringify(event, null, 2)}`);

    const token = event.headers.Authorization;
    switch (token) {
        case 'allow':
            callback(null, generatePolicy('user', 'Allow', event.methodArn));
            break;
        case 'deny':
            callback(null, generatePolicy('user', 'Deny', event.methodArn));
            break;
        case 'unauthorized':
            callback('Unauthorized'); // Return a 401 Unauthorized response
            break;
        default:
            callback('Error: Invalid token'); // Return a 500 Invalid token response
    }
};
