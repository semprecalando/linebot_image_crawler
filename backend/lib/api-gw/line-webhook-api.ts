import { Stack } from "aws-cdk-lib";
import { IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Function } from 'aws-cdk-lib/aws-lambda';

export const createWebhookAPI = (stack: Stack, lambda: Function) => {
  const api = new RestApi(stack, 'lineWebhook', {
    restApiName: 'lineWebhook API',
  });
  const content = api.root.addResource('content');
  const postContentIntegration = new LambdaIntegration(lambda);
  content.addMethod('POST', postContentIntegration);
  addCorsOptions(content);
  return api;
}

const addCorsOptions = (apiResource: IResource) => {
  apiResource.addMethod(
    'OPTIONS',
  new MockIntegration({
  integrationResponses: [
  {
  statusCode: '200',
  // ここのシングルクォートとダブルクォートを入れ替えたらエラーになる
  responseParameters: {
    "method.response.header.Access-Control-Allow-Headers":
    "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
    "method.response.header.Access-Control-Allow-Credentials":
    "'false'",
    "method.response.header.Access-Control-Allow-Methods":
    "'OPTIONS,GET,PUT,POST,DELETE'",
  },
  },
  ],
  passthroughBehavior: PassthroughBehavior.NEVER,
  requestTemplates: {
    'application/json': '{"statusCode": 200}',
  },
  }),
    {
    methodResponses: [
      {
      statusCode: '200',
        responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        },
      },
    ],
    }
  );
}