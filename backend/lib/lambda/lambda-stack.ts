import { Role } from 'aws-cdk-lib/aws-iam';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Duration, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const arrowOrigin = '*';

export const createImageCrawlerLambda = (stack: Stack, imageBucket: Bucket, imageCrowlerRole: Role) => new Function(stack, 'image-crawler', {
  code: new AssetCode('lib/lambda/image-crawler'),
  handler: 'image-crawler.handler',
  runtime: Runtime.NODEJS_16_X,
  timeout: Duration.seconds(10),
  role: imageCrowlerRole,
  environment: {
    ALLOW_ORIGIN: arrowOrigin,
    LINE_ACCESS_TOKEN: stack.node.tryGetContext('lineAccessToken'),
    LINE_ACCESS_SECRET: stack.node.tryGetContext('lineAccessSecret'),
    IMAGE_BUCKET_NAME: imageBucket.bucketName
  },
});

export const createFaceMatcherLambda = (stack: Stack, imageBucket: Bucket, faceBucket: Bucket, dynamoTable: Table, faceMatcherRole: Role, imageDir?: string) => {
  const lambda = new Function(stack, 'face-matcher', {
    code: new AssetCode('lib/lambda/face-matcher'),
    handler: 'face-matcher.handler',
    runtime: Runtime.NODEJS_16_X,
    timeout: Duration.seconds(10),
    role: faceMatcherRole,
    environment: {
      ALLOW_ORIGIN: arrowOrigin,
      TABLE_NAME: dynamoTable.tableName,
      FACE_BUCKET_NAME: faceBucket.bucketName
    },
  });
  lambda.addEventSource(
    new S3EventSource(imageBucket, {
      filters: [{prefix: imageDir ? `${imageDir}/` : "images/"}],
      events: [EventType.OBJECT_CREATED]
    })
  );
  return lambda;
}