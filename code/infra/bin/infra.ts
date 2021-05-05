#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfraStack } from '../lib/infra-stack';
import { Construct, Tags } from '@aws-cdk/core';

class WebAppService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        new InfraStack(this, 'v1', {
            description: 'Sample Web App',
        });
    }
}

const app = new cdk.App();
new WebAppService(app, 'WebAppStack');

Tags.of(app).add('stage', 'poc');
Tags.of(app).add('context', 'web-app');
