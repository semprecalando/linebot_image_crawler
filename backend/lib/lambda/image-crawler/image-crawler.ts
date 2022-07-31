import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as line from "@line/bot-sdk";
import { TextMessage, WebhookRequestBody } from "@line/bot-sdk";

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || "";
const LINE_ACCESS_SECRET = process.env.LINE_ACCESS_SECRET || "";
const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME || "";
const IMAGE_DIR = process.env.IMAGE_DIR || "images";

const CONFIG = {
  channelAccessToken:LINE_ACCESS_TOKEN,
  channelSecret: LINE_ACCESS_SECRET,
}
const LINE_CLIENT = new line.Client(CONFIG);

const s3Client = new S3Client({
  region: 'ap-northeast-1'
})

type Response = {
  isBase64Encoded: Boolean,
  statusCode: Number,
  headers: {},
  body: String
}

// Todo: async/awaitのエラーハンドリング

const replyText = async(event: line.MessageEvent, text: string) => {
  const replyToken = event.replyToken;
  const message: TextMessage = {type: "text",text: text};
  await LINE_CLIENT.replyMessage(replyToken, message);
}

const putImage = async(event: line.MessageEvent) => {
  const content = await LINE_CLIENT.getMessageContent(event.message.id);
  const parallelUploads3 = new Upload({
    client: s3Client,
    queueSize: 4, // optional concurrency configuration
    leavePartsOnError: false, // optional manually handle dropped parts
    params: {
      Bucket: IMAGE_BUCKET_NAME,
      Key: `${IMAGE_DIR}/${event.message.id}_image.jpg`,
      Body: content
    },
  });
  parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });
  await parallelUploads3.done()
}

export const handler = async (event: any = {}): Promise<any> => {

  // Todo: 本格的に使う場合は消す
  console.log(event);
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
      //await replyText(event, event.message.text)
      await replyText(event, "話しかけてくれてありがとうございます！でもお返事はできないんです…");
    }
    else if (event.type == "message" && event.message.type == "image") {
      // Todo: 画像が受け取れなかった時のエラーメッセージ（awaitをキャッチする）
      await putImage(event);
      await replyText(event, "画像を受け取りました！");
    }
    else if (event.type == "message") {
      await replyText(event, "すいません、画像以外は対応していません…");
    }
  }

  res.body = "hello world!";
  return await res;
};