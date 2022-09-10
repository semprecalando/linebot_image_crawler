import { createFaceDetectTable } from './dynamo/face-detect-table';
import { createFaceMatcherRole, createImageCrowlerRole, createObjectGetterRole } from './iam/iam-stack';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createImageCrawlerLambda, createFaceMatcherLambda, createGetThumbnailListLambdaAPI, createScanTableLambda } from './lambda/lambda-stack';
import { createAccessTableAPI, createWebhookAPI } from './api-gw/api-stack'
import { createImageBucket, createFaceBucket, setHostingImagePolicy } from './s3/bucket-stack';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { createHostingCloudFront, createHostingOAI } from './cloudfront/hosting-edge';

export class LineBotImageCrawlerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAMロール群を定義
    const imageCrowlerRole = createImageCrowlerRole(this);
    const faceMacherRole = createFaceMatcherRole(this);
    const objectGetterRole = createObjectGetterRole(this);

    // S3バケットを定義
    const imageBucket = createImageBucket(this, [imageCrowlerRole], [faceMacherRole, objectGetterRole]);
    const imageCrawlerLambda = createImageCrawlerLambda(this, imageBucket, imageCrowlerRole);

    // Lambda群を定義
    const faceSourceBucket = createFaceBucket(this, [faceMacherRole]);
    const faceDetectTable = createFaceDetectTable(this);
    const scanFaceDetectTableLambda = createScanTableLambda(this, faceDetectTable, 'faceDetect');
    const faceMatcherLambda = createFaceMatcherLambda(this, imageBucket, faceSourceBucket, faceDetectTable, faceMacherRole);

    // dynamoDBにアクセスする設定
    faceDetectTable.grantReadWriteData(faceMatcherLambda);
    faceDetectTable.grantReadData(scanFaceDetectTableLambda);

    // API群を定義(API-GWおよびLambda function URLs)
    const webhookEventAPI = createWebhookAPI(this, imageCrawlerLambda);
    const accessFaceDetectTableAPI = createAccessTableAPI(this, scanFaceDetectTableLambda);
    const thumbnailListLambdaAPI = createGetThumbnailListLambdaAPI(this, imageBucket, objectGetterRole);

    // 画像用S3バケットに事前投入するファイルを設定(ディレクトリごと投入する)
    const faceImageDeployment = new BucketDeployment(this, 'deployFaceImages', {
      sources: [Source.asset('./faceImages')],
      destinationBucket: faceSourceBucket
    });

    // 静的コンテンツ配信用の設定
    const oai = createHostingOAI(this);
    const hostingCloudFront = createHostingCloudFront(this, imageBucket, oai);
    setHostingImagePolicy(oai, imageBucket);

    // Todo: ビルド用のスタックを用意して、マルチスタックビルドを行う
  }
}