import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Stack } from 'aws-cdk-lib';

export const createImageCrowlerRole = (stack: Stack) => {
  const imageCrowlerRole = new Role(
    stack,
    "imageCrowlerRole",
    {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ]
    },
  );
  return imageCrowlerRole;
}

export const createFaceMatcherRole = (stack: Stack) => {
  const faceMatcherRole = new Role(
    stack,
    "faceMatcherRole",
    {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonRekognitionReadOnlyAccess')
      ]
    },
  );
  return faceMatcherRole;
}