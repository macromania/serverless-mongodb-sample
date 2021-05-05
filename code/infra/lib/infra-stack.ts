import * as cdk from '@aws-cdk/core';
import { CfnOutput, CfnParameter } from '@aws-cdk/core';
import { ApiStack } from './api-stack';
import { WebAppStack } from './web-app-stack';

export class InfraStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const webAppStack = new WebAppStack(this, 'WebApp');
        const cloudFrontUrl = `https://${webAppStack.cloudFront.cloudFrontWebDistribution.distributionDomainName}`;

        const mongoDbUri = new CfnParameter(this, 'MongoDbUri', {
            type: 'String',
            description: 'MongoDb connection string',
        });

        const apiStack = new ApiStack(this, 'WebApi', {
            cloudFrontUrl: cloudFrontUrl,
            mongoDbUri: mongoDbUri.valueAsString,
        });

        new CfnOutput(this, 'WebAppUrl', {
            value: cloudFrontUrl,
            description: 'Web App Url',
        });

        new CfnOutput(this, 'Apiurl', {
            value: apiStack.restApi.url,
            description: 'Web App Url',
        });
    }
}
