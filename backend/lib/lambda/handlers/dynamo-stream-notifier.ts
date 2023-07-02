import { Function } from 'aws-cdk-lib/aws-lambda';
import gql from 'graphql-tag';
import AWSAppSyncClient from "aws-appsync";
// サーバサイドでfetch(appsync内部で利用)を使うためのimport
// import 'isomorphic-fetch';
import { FaceRecord, Response } from './utils';
import { LambdaClient, InvokeCommand, LogType } from "@aws-sdk/client-lambda";
import crypto from 'crypto';

const REGION = process.env.REGION || "ap-northeast-1";
const CHAT_URL = process.env.CHAT_URL || "CHAT_URL";
const CHAT_CHANNEL = process.env.CHAT_CHANNEL || "channel00";
const CHAT_API_KEY = process.env.CHAT_API_KEY || "CHAT_API_KEY";
const WEBSOCKET_DOMAIN = process.env.WEBSOCKET_DOMAIN || "";
const WS_LAMBDA_NAME = process.env.WS_LAMBDA_NAME || "";

/*
const appSyncClient = new AWSAppSyncClient({
  url: CHAT_URL,
  region: REGION,
  auth: {
    type: "API_KEY",
    apiKey: CHAT_API_KEY
  },
  disableOffline: true,
});
*/

const lambdaClient = new LambdaClient({region: REGION});

const createPublishMutation = (record: FaceRecord) => {
  console.log("createPublishMutation");
  const publishMutation = gql(`mutation PublishData {
    publish(data: "${JSON.stringify(record).replace(/"/g, '\\"')}", name: "${CHAT_CHANNEL}") {
      name
      data
    }
  }`);
  return publishMutation;
};

const createLambdaInput = (record: FaceRecord) => {

  const input = {
    "requestContext": {
        "routeKey": "sendmessage",
        "messageId": "dynamoDB-stream-notifier",
        "eventType": "MESSAGE",
        "messageDirection": "IN",
        "stage": "production",
        "domainName": WEBSOCKET_DOMAIN,
        "connectionId": "dynamoDB-stream-notifier",
        "apiId": WEBSOCKET_DOMAIN.split(".")[0]
    },
    "body": JSON.stringify({"action": "sendmessage", "message": JSON.stringify(record)}),
    "isBase64Encoded": false
  };
  return input;
};

const createParams = (record: FaceRecord) => {
  const params = {
    "data": JSON.stringify(record),
    "name": CHAT_CHANNEL
  }
  return params;
};

export const publishMutate = async (record: FaceRecord) => {
  try {
    console.log("mutate");
    // await appSyncClient.mutate({
    //   mutation: createPublishMutation(record)
    // });
    const invokeCommand = new InvokeCommand({
      FunctionName: WS_LAMBDA_NAME,
      Payload: JSON.stringify(createLambdaInput(record)),
      LogType: LogType.Tail,
    });
    await lambdaClient.send(invokeCommand);
    console.log("success")
  } catch (err) {
    console.log("mutate error");
    console.log(JSON.stringify(err));
  }
};

export const handler = async (event: any = {}): Promise<any> => {
  const res: Response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  };
  console.log(JSON.stringify(event));
  for (const dbRecord of event.Records) {
    const isInsert = (dbRecord.eventName ? dbRecord.eventName : "") == ("INSERT");
    if (isInsert) {
      const imageName = dbRecord.dynamodb.NewImage.imageName.S;
      const newInputRecord: FaceRecord = { imageName: imageName };
      await publishMutate(newInputRecord);
    }
  }

  return res;
};