import { CfnOutput, Stack } from "aws-cdk-lib";
import { IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Function } from 'aws-cdk-lib/aws-lambda';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha/lib/websocket";

export const createWebhookAPI = (stack: Stack, lambda: Function) => {
  const api = new RestApi(stack, 'lineWebhook', {
    restApiName: 'lineWebhook API',
  });
  const content = api.root.addResource('content');
  const postContentIntegration = new LambdaIntegration(lambda);
  content.addMethod('POST', postContentIntegration);
  addCorsOptions(content);
  return api;
};

export const createAccessTableAPI = (stack: Stack, scanTableLambda: Function) => {
  const api = new RestApi(stack, 'accessTableAPI', {
    restApiName: 'Access dynamodb table API',
  });
  const content = api.root.addResource('facedetect');
  const scanTableIntegration = new LambdaIntegration(scanTableLambda);
  content.addMethod('GET', scanTableIntegration);
  addCorsOptions(content);
  return api;
};

export const createWebsocketAPI = (stack: Stack, connectHandler: Function, disConnectHandler: Function, messageHandler: Function,  defaultHandler: Function) => {
  const api = new WebSocketApi(stack, 'websocketAPI', {
    apiName: 'LINEBOT Websocket API',
    routeSelectionExpression: '$request.body.action',
    connectRouteOptions: {
      integration: new WebSocketLambdaIntegration('MessageApiConnectIntegration', connectHandler),
    },
    disconnectRouteOptions: {
      integration: new WebSocketLambdaIntegration('MessageApiDisconnectIntegration', disConnectHandler),
    },
    defaultRouteOptions: {
      integration: new WebSocketLambdaIntegration('MessageApiDefaultIntegration', defaultHandler),
    },
  });
  api.addRoute('sendmessage', {
    integration: new WebSocketLambdaIntegration('MessageApiSendIntegration', messageHandler),
  });
  api.grantManageConnections(messageHandler);
  api.grantManageConnections(defaultHandler);
  new WebSocketStage(stack, 'WsApiProduction', {
    webSocketApi: api,
    stageName: 'production',
    autoDeploy: true,
  });
  new CfnOutput(stack, 'WebsocketEndpoint', {
    value: `${api.apiEndpoint}`,
  })
  return api;
};

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
};