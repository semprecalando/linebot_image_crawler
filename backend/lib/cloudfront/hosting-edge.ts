import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { CloudFrontWebDistribution, OriginAccessIdentity, PriceClass } from "aws-cdk-lib/aws-cloudfront";

export const createHostingOAI = (stack: Stack) => {
  // CFNからのアクセス設定
  const oai = new OriginAccessIdentity(stack, "hosting-s3-oai");
  return oai;
}

export const createHostingCloudFront = (stack: Stack, imageBbucket: Bucket, hostingBucket: Bucket, oai: OriginAccessIdentity) => {
  const cloudFront = new CloudFrontWebDistribution(stack, "hosting-cloudfront", {
    viewerCertificate: {
      aliases: [],
      props: {
        cloudFrontDefaultCertificate: true,
      },
    },
    priceClass: PriceClass.PRICE_CLASS_200,
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource: hostingBucket,
          originAccessIdentity: oai,
        },
        behaviors: [
          {
            isDefaultBehavior: true,
            minTtl: Duration.seconds(0),
            maxTtl: Duration.days(0),
            defaultTtl: Duration.days(0),
            pathPattern: '*',
          },
        ],
      },
      {
        s3OriginSource: {
          s3BucketSource: imageBbucket,
          originAccessIdentity: oai,
        },
        behaviors: [
          {
            isDefaultBehavior: false,
            minTtl: Duration.seconds(0),
            maxTtl: Duration.days(0),
            defaultTtl: Duration.days(0),
            pathPattern: 'thumbnails/*',
          },
          {
            isDefaultBehavior: false,
            minTtl: Duration.seconds(0),
            maxTtl: Duration.days(0),
            defaultTtl: Duration.days(0),
            pathPattern: 'images/*',
          },
        ],
      }
    ]
  });
  // コンソールに表示する出力設定
  new CfnOutput(stack, 'CloudFrontDomen', {
    value: `https://${cloudFront.distributionDomainName}`,
  })
  return cloudFront;
}