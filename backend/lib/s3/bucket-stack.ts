import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { CanonicalUserPrincipal, Effect, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";

export const createImageBucket = (stack: Stack, allowPutRoles: Role[], allowReadRoles: Role[]) => {
  const bucket = new Bucket(stack, "line_crawel_image",{
    removalPolicy: RemovalPolicy.DESTROY,
    lifecycleRules: [
      {
        id: 'delete-multipart-garbage',
        abortIncompleteMultipartUploadAfter: Duration.days(6)
      }
    ],
    // cors設定は開発時のみ利用する
    cors: [
      {
        allowedMethods: [
          HttpMethods.GET,
        ],
        allowedOrigins: ['http://localhost:3000'],
        allowedHeaders: ['*'],
      },
    ],
  });
  bucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:PutObject"],
      principals: allowPutRoles,
      resources: [bucket.bucketArn + "/*"]
    })
  );
  for (const role of allowReadRoles) {
    bucket.grantRead(role);
  }
  return bucket;
};

export const createFaceBucket = (stack: Stack, allowGetRoles: Role[]) => {
  const bucket = new Bucket(stack, "face_source_image",{
    removalPolicy: RemovalPolicy.DESTROY,
    lifecycleRules: [
      {
        id: 'delete-multipart-garbage',
        abortIncompleteMultipartUploadAfter: Duration.days(6)
      }
    ]
  });
  bucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      principals: allowGetRoles,
      resources: [bucket.bucketArn + "/*"]
    })
  );
  return bucket;
};

export const setHostingImagePolicy = (oai: OriginAccessIdentity, bucket: Bucket) => {
  bucket.grantRead(oai);
  return bucket;
}

export const setHostingSPAPolicy = (oai: OriginAccessIdentity, bucket: Bucket) => {
  const myBucketPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['s3:GetObject'],
    principals: [
      new CanonicalUserPrincipal(
        oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
      ),
    ],
    resources: [bucket.bucketArn + '/*'],
  });
  bucket.addToResourcePolicy(myBucketPolicy);

  return bucket;
}