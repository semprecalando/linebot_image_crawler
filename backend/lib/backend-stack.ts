import { createFaceDetectTable } from './dynamo/face-detect-table';
import { createFaceMatcherRole, createImageCrowlerRole } from './iam/iam-stack';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createImageCrawlerLambda, createFaceMatcherLambda } from './lambda/lambda-stack';
import { createWebhookAPI } from './api-gw/line-webhook-api';
import { createImageBucket, createFaceBucket } from './s3/bucket-stack';

export class LineBotImageCrawlerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const imageCrowlerRole = createImageCrowlerRole(this);
    const faceMacherRole = createFaceMatcherRole(this);

    const imageBucket = createImageBucket(this, [imageCrowlerRole], [faceMacherRole]);
    const imageCrawlerLambda = createImageCrawlerLambda(this, imageBucket, imageCrowlerRole);

    const webhookEventAPI = createWebhookAPI(this, imageCrawlerLambda);

    const faceSourceBucket = createFaceBucket(this, [faceMacherRole]);
    const faceDetectTable = createFaceDetectTable(this);
    const faceMatcherLambda = createFaceMatcherLambda(this, imageBucket, faceSourceBucket, faceDetectTable, faceMacherRole);
    faceDetectTable.grantReadWriteData(faceMatcherLambda);
  }
}