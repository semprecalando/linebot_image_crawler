import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createHelloLambda } from './lambda/lambda-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class LineBotImageCrawlerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const helloLambda = createHelloLambda(this);
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BackendQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
