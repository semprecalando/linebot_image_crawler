import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";

export const createImageBucket = (stack: Stack, allowPutRoles: Role[], allowGetRoles: Role[]) => {
  const bucket = new Bucket(stack, "line_crawel_image",{
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
      actions: ["s3:PutObject"],
      principals: allowPutRoles,
      resources: [bucket.bucketArn + "/*"]
    })
  );
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