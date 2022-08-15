import { Role } from 'aws-cdk-lib/aws-iam';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { FunctionUrlAuthType, HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

const arrowOrigin = '*';

export const createImageCrawlerLambda = (stack: Stack, imageBucket: Bucket, imageCrowlerRole: Role) => new NodejsFunction(stack, 'image-crawler', {
  entry: 'lib/lambda/handlers/image-crawler.ts',
  runtime: Runtime.NODEJS_16_X,
  timeout: Duration.seconds(10),
  role: imageCrowlerRole,
  bundling: {
    nodeModules: ['sharp'],
  },
  environment: {
    ALLOW_ORIGIN: arrowOrigin,
    LINE_ACCESS_TOKEN: stack.node.tryGetContext('lineAccessToken'),
    LINE_ACCESS_SECRET: stack.node.tryGetContext('lineAccessSecret'),
    IMAGE_BUCKET_NAME: imageBucket.bucketName
  },
});

export const createFaceMatcherLambda = (stack: Stack, imageBucket: Bucket, faceBucket: Bucket, dynamoTable: Table, faceMatcherRole: Role, imageDir?: string) => {
  const lambda = new NodejsFunction(stack, 'face-matcher', {
    entry: 'lib/lambda/handlers/face-matcher.ts',
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

export const createGetThumbnailListLambdaAPI = (stack: Stack, imageBucket: Bucket, objectGetterRole: Role) => {
  const lambda = new NodejsFunction(stack, 'thumbnail-lister', {
    entry: 'lib/lambda/handlers/thumbnail-lister.ts',
    runtime: Runtime.NODEJS_16_X,
    timeout: Duration.seconds(10),
    role: objectGetterRole,
    environment: {
      ALLOW_ORIGIN: arrowOrigin,
      IMAGE_BUCKET_NAME: imageBucket.bucketName
    },
  });
  const fucntionUrl = lambda.addFunctionUrl({
    authType: FunctionUrlAuthType.NONE,
    cors: {
      allowedMethods: [HttpMethod.ALL],
      allowedOrigins: [arrowOrigin],
    },
  });
  new CfnOutput(stack, 'thumbnailListLambdaEndpoint', {
    value: `${fucntionUrl.url}`,
  })
  return lambda;
}

export const createScanTableLambda = (stack: Stack, dynamoTable: Table, tag: string) => {
  const lambda = new NodejsFunction(stack, `scan-${tag}-table`, {
    entry: 'lib/lambda/handlers/table-scanner.ts',
    runtime: Runtime.NODEJS_16_X,
    timeout: Duration.seconds(10),
    environment: {
      ALLOW_ORIGIN: arrowOrigin,
      TABLE_NAME: dynamoTable.tableName,
    },
  });
  return lambda;
}