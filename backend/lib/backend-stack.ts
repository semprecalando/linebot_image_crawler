import { createFaceDetectTable, createWsConnectionTable } from './dynamo/face-detect-table';
import { createFaceMatcherRole, createImageCrowlerRole, createObjectGetterRole, createWsMessagePushRole } from './iam/iam-stack';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createImageCrawlerLambda,
         createFaceMatcherLambda,
         createGetThumbnailListLambdaAPI,
         createScanTableLambda,
         createDynamoStreamNotifierLambda, 
         createWsConnectLambda,
         createWsDisconnectLambda,
         createWsMessageLambda} from './lambda/lambda-stack';
import { createAccessTableAPI, createWebhookAPI, createWebsocketAPI } from './api-gw/api-stack'
import { createImageBucket, createFaceBucket, setHostingImagePolicy, createHostingBucket, setHostingSPAPolicy } from './s3/bucket-stack';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { createHostingCloudFront, createHostingOAI } from './cloudfront/hosting-edge';

export class LineBotImageCrawlerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAMロール群を定義
    const imageCrowlerRole = createImageCrowlerRole(this);
    const faceMacherRole = createFaceMatcherRole(this);
    const objectGetterRole = createObjectGetterRole(this);
    const wsMessagePushRole = createWsMessagePushRole(this);

    // S3バケットを定義
    const imageBucket = createImageBucket(this, [imageCrowlerRole], [faceMacherRole, objectGetterRole]);
    const faceSourceBucket = createFaceBucket(this, [faceMacherRole]);
    const hostingBucket = createHostingBucket(this);

    // dynamoDBを定義
    const faceDetectTable = createFaceDetectTable(this);
    const wsConnectionTable = createWsConnectionTable(this);

    // Lambda群を定義
    const imageCrawlerLambda = createImageCrawlerLambda(this, imageBucket, imageCrowlerRole);
    const scanFaceDetectTableLambda = createScanTableLambda(this, faceDetectTable, 'faceDetect');
    const faceMatcherLambda = createFaceMatcherLambda(this, imageBucket, faceSourceBucket, faceDetectTable, faceMacherRole);
    const wsConnectLambda = createWsConnectLambda(this, wsConnectionTable);
    const wsDisconnectLambda = createWsDisconnectLambda(this, wsConnectionTable);
    const wsMessageLambda = createWsMessageLambda(this, wsConnectionTable);

    // dynamoDBにアクセスする設定
    faceDetectTable.grantReadWriteData(faceMatcherLambda);
    faceDetectTable.grantReadData(scanFaceDetectTableLambda);
    wsConnectionTable.grantReadWriteData(wsConnectLambda);
    wsConnectionTable.grantReadWriteData(wsDisconnectLambda);
    wsConnectionTable.grantReadData(wsMessageLambda);

    // API群を定義(API-GWおよびLambda function URLs)
    const webhookEventAPI = createWebhookAPI(this, imageCrawlerLambda);
    const accessFaceDetectTableAPI = createAccessTableAPI(this, scanFaceDetectTableLambda);
    const thumbnailListLambdaAPI = createGetThumbnailListLambdaAPI(this, imageBucket, objectGetterRole);
    const webSocketAPI = createWebsocketAPI(this, wsConnectLambda, wsDisconnectLambda, wsMessageLambda, wsMessageLambda);

    // Websocketのmessage apiを直接呼び出すLambda(Dybamo streamをイベントトリガとする)
    const faceDetectTableNorifier = createDynamoStreamNotifierLambda(this, faceDetectTable, wsMessagePushRole, wsMessageLambda, webSocketAPI, 'faceDetect');

    // 画像用S3バケットに事前投入するファイルを設定(ディレクトリごと投入する)
    const faceImageDeployment = new BucketDeployment(this, 'deployFaceImages', {
      sources: [Source.asset('./faceImages')],
      destinationBucket: faceSourceBucket
    });

    // 静的コンテンツ配信用の設定
    const oai = createHostingOAI(this);
    const hostingCloudFront = createHostingCloudFront(this, imageBucket, hostingBucket, oai);
    setHostingImagePolicy(oai, imageBucket);
    setHostingSPAPolicy(oai, hostingBucket);

    // Todo: ビルド用のスタックを用意して、マルチスタックビルドを行う
  }
}