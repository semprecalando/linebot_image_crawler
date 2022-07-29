import { Stack } from 'aws-cdk-lib';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export const createHelloLambda = (stack: Stack) => new Function(stack, 'hello-world', {
  code: new AssetCode('lib/lambda/hello-world'),
  handler: 'hello-world.handler',
  runtime: Runtime.NODEJS_14_X,
  environment: {},
});