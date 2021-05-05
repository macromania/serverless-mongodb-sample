# Serverless MongoDB Application

This is an application demonstrating accessing to data stored in a MongoDB database using a custom authorization.

![](/docs/arc.jpg)

**This application overall demonstrates:**

1. Creating a SPA distributed via CloudFront and privately stored in an S3 bucket
1. Creating a REST API Gateway for providing API access to SPA
1. A Custom Lambda Authorizer at REST API Gateway for access control
1. Add custom authorization context from Lambda Authorizer
1. A Lambda Function connects to provided MongoDB database
1. Access to custom authorization context in Lambda Function provided after authorization

**!!!This application doesn't implement!!!**

1. OAuth integration to 3rd party/custom authorization provider at SPA
1. SPA connecting to API
1. WAF rules (see below for more details)
1. CORS rules on API Gateway

## SPA

A React App created using the template from:  
https://github.com/mui-org/material-ui/tree/master/examples/create-react-app-with-typescript

## API

NodeJS based Lambda Functions used for providing API logic in `/src/api` folder.

**auth/verify/index.js**: Runs custom logic to provide/deny access to any incoming request to API.  
**service/query/index.js**: Returns a dummy data demonstrating connection to DB and authorization context.

## WAF

WAFs are needed to be created from AWS console and attached to CloudFront and API Gateway.
They are not created using CDK:

-   WAF V2 High Level constructs are still in development:
-   https://github.com/aws/aws-cdk/issues/6878
-   Web ACL needs to be created manually from console and attached to this distrubtion
-   https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafv2-readme.html

## Infrastructure as Code

`/infra` folder contains a CDK Typescript application to build the infrastrcture for this architecture.

# Deployment

You will need:

-   An AWS account
-   Latest CDK

**Notes**

-   **You are responsible for the cost of the AWS services used while running this sample deployment. There is no additional cost for using this sample.**
-   **This code is not ready to run in your production environment and needs to be carefully reviewed before running.**

1. Before deploying SPA using CDK, you need to create a build package by running `npm build` in `/src/app` folder.
2. Before deploying Lambda functions, run `npm install` in their corresponding folders to make sure the dependencies are also included in the deployment
3. Follow commands in `/infra` directory for CDK deployment

# Testing

If all the deployment steps followed and artifacts deployed succesfully, you can call the sample endpoint for following scenarios:

## Authorized Query

**Request**

```
HTTP GET: {api-gateway-url}/v1/query

Headers
Authorization: allow
```

**Response**

```
200 OK

{
    "status": "success",
    "result": {
        "db": "sample_analytics"
    },
    "requestId": "2de4fc8f-2728-405a-898b-3364d7eb8f2a",
    "authContext": {
        "stringKey": "stringval",
        "numberKey": "123",
        "booleanKey": "true"
    }
}
```

## Denied Query

**Request**

```
HTTP GET: {api-gateway-url}/v1/query

Headers
Authorization: deny
```

**Response**

```
403 Forbidden

{
    "Message": "User is not authorized to access this resource with an explicit deny"
}
```

## Missing Authorization Header Query

**Request**

```
HTTP GET: {api-gateway-url}/v1/query

Headers
Authorization:
```

**Response**

```
401 Unauthorized

{
    "message": "Unauthorized"
}
```

## Cleanup

Running following command in `/infra` folder will destroy the whole stack.

```
cdk destroy
```
