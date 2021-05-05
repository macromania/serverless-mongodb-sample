import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import {
    AuthorizationType,
    Deployment,
    IdentitySource,
    LambdaIntegration,
    RequestAuthorizer,
    RestApi,
    Stage,
} from '@aws-cdk/aws-apigateway';

interface ApiStakProps extends cdk.NestedStackProps {
    cloudFrontUrl: string;
    mongoDbUri: string;
}

export class ApiStack extends cdk.NestedStack {

    public readonly restApi: RestApi;

    constructor(scope: cdk.Construct, id: string, props?: ApiStakProps) {
        super(scope, id, props);

        /**
         * Custom Authorization Lambda Function
         */
        const authorizationHandler = new lambda.Function(this, 'CustomAuthorizer', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('../src/api/auth/verify'),
            handler: 'index.handler',
            logRetention: 3,
            environment: {
                // Environment variables to pass as key:value
            },
        });

        /**
         * API Gateway Lambda Authorizer
         */
        const authorizer = new RequestAuthorizer(this, 'AuthVerify', {
            handler: authorizationHandler,
            identitySources: [IdentitySource.header('Authorization')],
        });

        /**
         * API Gateway - REST API
         */
        this.restApi = new RestApi(this, 'Api', {
            defaultMethodOptions: {
                authorizationType: AuthorizationType.CUSTOM,
                authorizer: authorizer,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: [props?.cloudFrontUrl ?? ""]
            }
        });
        this.restApi.root.addMethod('ANY');

        /**
         * Query Service Lambda
         */
        const queryServiceHandler = new lambda.Function(this, 'QueryService', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('../src/api/service/query'),
            handler: 'index.handler',
            logRetention: 3,
            environment: {
                MONGODB_URI: props?.mongoDbUri ?? ""
            },
        });

        /**
         * Integrate Query Service to API Gateway
         */
        const queryServiceIntegration = new LambdaIntegration(queryServiceHandler);

        /**
         * Create GET /query endpoint
         */
        const greetings = this.restApi.root.addResource('query');
        const getMethod = greetings.addMethod('GET', queryServiceIntegration, {
            apiKeyRequired: false,
            authorizationType: AuthorizationType.CUSTOM,
        });
        this.restApi.methods.push(getMethod);

        /**
         * Deploy endpoints to v1 stage
         */
        const deployment = new Deployment(this, 'deployment-' + new Date().toISOString(), {
            api: this.restApi,
        });
        const prodStage = new Stage(this, 'v1', {
            deployment: deployment,
            stageName: 'v1',
        });

        this.restApi.deploymentStage = prodStage;
    }
}
