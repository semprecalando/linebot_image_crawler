import { createImageCrowlerRole } from './iam/iam-stack';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createImageCrawlerLambda } from './lambda/lambda-stack';
import { createWebhookAPI } from './api-gw/line-webhook-api';
import { createImageBucket } from './s3/image-backet';

export class LineBotImageCrawlerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const imageCrowlerRole = createImageCrowlerRole(this);
    const imageBucket = createImageBucket(this, [imageCrowlerRole]);
    const imageCrawlerLambda = createImageCrawlerLambda(this, imageBucket, imageCrowlerRole);

    const webhookEventAPI = createWebhookAPI(this, imageCrawlerLambda);
  }
}
