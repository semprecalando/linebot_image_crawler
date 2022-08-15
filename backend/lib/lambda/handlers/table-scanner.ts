// 特定ユーザの顔が写っているかをrekognitionでスキャンし、結果をdynamoDBに格納する
import { DynamoDBClient, ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME || "";
const REGION = process.env.REGION || "ap-northeast-1";

const dynamoDBClient = new DynamoDBClient({
  region: REGION,
})

const scanRecord = async () => {
  const input: ScanCommandInput = {
    TableName: TABLE_NAME,
  }
  console.log(JSON.stringify(input));
  const data = await dynamoDBClient.send(new ScanCommand(input));
  console.log(JSON.stringify(data));
  return data;
}

export const handler = async (event: any = {}): Promise<any> => {

  console.log(JSON.stringify(event));
  const res = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  }

  const data = await scanRecord();

  res.body = JSON.stringify(data.Items ? data.Items: []);
  return await res;
};