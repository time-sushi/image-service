import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { config } from 'dotenv';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { HttpMethods } from 'aws-cdk-lib/aws-s3';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

config();

export class ImageServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(
      this,
      'time-sushi-image-service-prod',
      {
        bucketName: 'time-sushi-image-service-prod',
        accessControl: cdk.aws_s3.BucketAccessControl.PRIVATE
      }
    );

    new cdk.aws_cloudfront.Distribution(
      this,
      'time-sushi-image-service-prod-cloudfront',
      {
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(bucket),
          allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          viewerProtocolPolicy:
            cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        }
      }
    );

    const lambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'time-sushi-image-service-prod-get-presigned-urls',
      {
        functionName: 'time-sushi-image-service-prod-get-presigned-urls',
        memorySize: 128,
        runtime: Runtime.NODEJS_16_X,
        timeout: Duration.seconds(10),
        entry: path.join(__dirname, './handlers/get-presigned-urls/index.ts'),
        logRetention: RetentionDays.ONE_DAY,
        environment: {
          BUCKET_NAME: bucket.bucketName,
          PRESIGNED_URL_TTL: '3600' // seconds,
        }
      }
    );

    const api = new cdk.aws_apigateway.RestApi(
      this,
      'time-sushi-image-service-prod-api',
      {
        restApiName: 'time-sushi-image-service-prod-api',
        defaultCorsPreflightOptions: {
          allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
          allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
          allowHeaders: cdk.aws_apigateway.Cors.DEFAULT_HEADERS
        }
      }
    );

    api.root
      .addResource('get-presigned-url')
      .addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(lambda));

    bucket.grantPut(lambda);
    bucket.grantPutAcl(lambda);
    bucket.addCorsRule({
      allowedMethods: [
        HttpMethods.POST,
        HttpMethods.PUT,
        HttpMethods.GET,
        HttpMethods.DELETE
      ],
      allowedOrigins: ['*'],
      allowedHeaders: [
        'Access-Control-Allow-Origin',
        'Content-Type',
        'Content-Length'
      ],
      exposedHeaders: [
        'Access-Control-Allow-Origin',
        'Content-Type',
        'Content-Length'
      ]
    });
  }
}
