import { Duration, Stack } from 'aws-cdk-lib';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

const arrowOrigin = '*';

export const createImageCrawlerLambda = (stack: Stack) => new Function(stack, 'image-crawler', {
  code: new AssetCode('lib/lambda/image-crawler'),
  handler: 'image-crawler.handler',
  runtime: Runtime.NODEJS_14_X,
  timeout: Duration.seconds(10),
  environment: {
    ALLOW_ORIGIN: arrowOrigin,
    LINE_ACCESS_TOKEN: stack.node.tryGetContext('lineAccessToken'),
    LINE_ACCESS_SECRET: stack.node.tryGetContext('lineAccessSecret')
  },
});