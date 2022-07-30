import * as line from "@line/bot-sdk";
import { Message, TextMessage, WebhookRequestBody } from "@line/bot-sdk";

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

  // Todo: 本格的に使う場合は消す
  console.log(event)
  const res: Response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  }

  const webhookEvent: WebhookRequestBody = JSON.parse(event["body"]);
  for (const event of webhookEvent.events) {
    // テキストメッセージの場合おうむ返しする
    if (event.type == "message" && event.message.type == "text") {
      const replyToken = event.replyToken;
      const message: TextMessage = {type: "text",text: event.message.text};
      await LINE_CLIENT.replyMessage(replyToken, message);
    }
  }

  res.body = "hello world!";
  return await res;
};