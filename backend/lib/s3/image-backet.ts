import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";

export const createImageBucket = (stack: Stack, allowPutRoles: Role[]) => {
  const bucket = new Bucket(stack, "line_crawel_image",{
    removalPolicy: RemovalPolicy.DESTROY,
  });
  // 特定のRoleを持つサービスからの書き込みを許可
  bucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:PutObject"],
      principals: allowPutRoles,
      resources: [bucket.bucketArn + "/*"]
    })
  );
  return bucket;
};