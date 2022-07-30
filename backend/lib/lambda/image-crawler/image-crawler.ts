import * as line from "@line/bot-sdk";
import { TextMessage, WebhookEvent } from "@line/bot-sdk";

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || "";
const LINE_ACCESS_SECRET = process.env.LINE_ACCESS_SECRET || "";

const CONFIG = {
  channelAccessToken:LINE_ACCESS_TOKEN,
  channelSecret: LINE_ACCESS_SECRET,
}
const LINE_CLIENT = new line.Client(CONFIG);

type Response = {
  isBase64Encoded: Boolean,
  statusCode: Number,
  headers: {},
  body: String
}

export const handler = async (event: any = {}): Promise<any> => {

  const signature = event["headers"]["x-line-signature"]
  const body = event["body"]

  console.log(event)
  console.log(body)
  const res: Response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  }
  res.body = "hello world!";
  return await res;
};