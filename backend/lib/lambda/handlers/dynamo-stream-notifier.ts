import { FaceRecord, Response } from './utils';
import { LambdaClient, InvokeCommand, LogType } from "@aws-sdk/client-lambda";

const REGION = process.env.REGION || "ap-northeast-1";
const WEBSOCKET_DOMAIN = process.env.WEBSOCKET_DOMAIN || "";
const WS_LAMBDA_NAME = process.env.WS_LAMBDA_NAME || "";

const lambdaClient = new LambdaClient({region: REGION});

const createLambdaInput = (record: FaceRecord) => {
  // API Gataway Websocket用のLambdaイベント
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

export const publishMutate = async (record: FaceRecord) => {
  try {
    console.log("send");
    const invokeCommand = new InvokeCommand({
      FunctionName: WS_LAMBDA_NAME,
      Payload: JSON.stringify(createLambdaInput(record)),
      LogType: LogType.Tail,
    });
    await lambdaClient.send(invokeCommand);
    console.log("success")
  } catch (err) {
    console.log("send error");
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