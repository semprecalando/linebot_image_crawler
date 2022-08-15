import { createFaceDetectTable } from './dynamo/face-detect-table';
import { createFaceMatcherRole, createImageCrowlerRole, createObjectGetterRole } from './iam/iam-stack';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createImageCrawlerLambda, createFaceMatcherLambda, createGetThumbnailListLambda } from './lambda/lambda-stack';
import { createWebhookAPI } from './api-gw/line-webhook-api';
import { createImageBucket, createFaceBucket, setHostingImagePolicy } from './s3/bucket-stack';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { createHostingCloudFront, createHostingOAI } from './cloudfront/hosting-edge';

export class LineBotImageCrawlerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 各種コンポーネントを定義
    const imageCrowlerRole = createImageCrowlerRole(this);
    const faceMacherRole = createFaceMatcherRole(this);
    const objectGetterRole = createObjectGetterRole(this);

    const imageBucket = createImageBucket(this, [imageCrowlerRole], [faceMacherRole, objectGetterRole]);
    const imageCrawlerLambda = createImageCrawlerLambda(this, imageBucket, imageCrowlerRole);

    const thumbnailListLambda = createGetThumbnailListLambda(this, imageBucket, objectGetterRole);

    const webhookEventAPI = createWebhookAPI(this, imageCrawlerLambda);

    const faceSourceBucket = createFaceBucket(this, [faceMacherRole]);
    const faceDetectTable = createFaceDetectTable(this);
    const faceMatcherLambda = createFaceMatcherLambda(this, imageBucket, faceSourceBucket, faceDetectTable, faceMacherRole);
    faceDetectTable.grantReadWriteData(faceMatcherLambda);

    // S3に投入するファイルを設定(ディレクトリごと投入する)
    const faceImageDeployment = new BucketDeployment(this, 'deployFaceImages', {
      sources: [Source.asset('./faceImages')],
      destinationBucket: faceSourceBucket
    });

    // 静的コンテンツ配信用の設定
    const oai = createHostingOAI(this);
    const hostingCloudFront = createHostingCloudFront(this, imageBucket, oai);
    setHostingImagePolicy(oai, imageBucket);
  }
}