import { BlockPublicAccess, HttpMethods } from '@aws-cdk/aws-s3';
import * as s3 from '@aws-cdk/aws-s3';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import * as cdk from '@aws-cdk/core';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export class WebAppStack extends cdk.NestedStack {
    public readonly cloudFront: CloudFrontToS3;

    constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
        super(scope, id, props);

        /**
         * Web App S3 bucket to host web app
         */
        const webappBucket = new s3.Bucket(this, "Source", {
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            cors: [
                {
                    maxAge: 3000,
                    allowedOrigins: ["*"],
                    allowedHeaders: ["*"],
                    allowedMethods: [HttpMethods.GET],
                },
            ],
        });

        /**
         * Logs bucket for S3 and CloudFront
         */
        const logsBucket = new s3.Bucket(this, "Logs", {
            encryption: s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        });

        /**
         * Solutions construct to create Cloudfrotnt with an s3 bucket as the origin
         * https://docs.aws.amazon.com/solutions/latest/constructs/aws-cloudfront-s3.html
         * insertHttpSecurityHeaders is set to false as this requires the deployment to be in us-east-1
         * -------
         * WAF V2 High Level constructs are still in development:
         * https://github.com/aws/aws-cdk/issues/6878
         * Web ACL needs to be created manually from console and attached to this distrubtion
         * https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafv2-readme.html
         */
        this.cloudFront = new CloudFrontToS3(this, "CloudFrontDist", {
            // @ts-ignore
            existingBucketObj: webappBucket,
            insertHttpSecurityHeaders: false,
            cloudFrontDistributionProps: {
                comment: `${cdk.Aws.STACK_NAME} Web App Distribution`,
                defaultCacheBehavior: {
                    allowedMethods: ["GET", "HEAD", "OPTIONS"],
                    Compress: false,
                    forwardedValues: {
                        queryString: false,
                        headers: ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
                        cookies: { forward: "none" },
                    },
                    viewerProtocolPolicy: "allow-all",
                },
                loggingConfig: {
                    bucket: logsBucket,
                    prefix: "cloudfront-logs",
                },
            },
        });

        /**
         * Deploy Web App build folder to S3 bucket
         */
        new s3deploy.BucketDeployment(this, "DeployWebApp", {
            sources: [s3deploy.Source.asset("../src/app/build/")],
            destinationBucket: webappBucket,
            // @ts-ignore
            distribution: this.cloudFront.cloudFrontWebDistribution,
        });
    }
}
