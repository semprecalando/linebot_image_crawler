import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from '@aws-sdk/client-s3';
import * as line from "@line/bot-sdk";
import { TextMessage, WebhookRequestBody } from "@line/bot-sdk";
import { createThumbnailFromReadable, getNowJSTDate, Response } from "./utils";
import { Readable } from "stream";

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || "";
const LINE_ACCESS_SECRET = process.env.LINE_ACCESS_SECRET || "";
const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME || "";
const IMAGE_DIR = process.env.IMAGE_DIR || "images";
const THUMBNAIL_DIR = process.env.IMAGE_DIR || "thumbnails";

const CONFIG = {
  channelAccessToken:LINE_ACCESS_TOKEN,
  channelSecret: LINE_ACCESS_SECRET,
}
const lineClient = new line.Client(CONFIG);

const s3Client = new S3Client({
  region: 'ap-northeast-1'
})

// Todo: async/awaitのエラーハンドリング

const replyText = async(event: line.MessageEvent, text: string) => {
  const replyToken = event.replyToken;
  const message: TextMessage = {type: "text",text: text};
  await lineClient.replyMessage(replyToken, message);
}

const putImage = async(content: Buffer | Readable, key: string) => {
  const parallelUploads3 = new Upload({
    client: s3Client,
    queueSize: 4, // optional concurrency configuration
    leavePartsOnError: false, // optional manually handle dropped parts
    params: {
      Bucket: IMAGE_BUCKET_NAME,
      Key: key,
      Body: content
    },
  });
  parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });
  await parallelUploads3.done()
}

const checkSignature = (event: any) => {
  // Todo: signatureAttributeの大文字小文字を区別しない (予告なくX-Line-Signatureなどに変わる可能性がある)
  const signature = event["headers"]["x-line-signature"];
  if (!line.validateSignature(event["body"], LINE_ACCESS_SECRET, signature)) {
    throw new line.SignatureValidationFailed("signature validation failed", signature);
  }
}

export const handler = async (event: any = {}): Promise<any> => {

  const res: Response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  }

  const webhookEvent: WebhookRequestBody = JSON.parse(event["body"]);
  checkSignature(event);
  for (const event of webhookEvent.events) {
    if (event.type == "message" && event.message.type == "text") {
      await replyText(event, "話しかけてくれてありがとうございます！でもお返事はできないんです…");
    }
    else if (event.type == "message" && event.message.type == "image") {
      // 現在日時(JST)を取得して画像パスに含める
      const imageFileName = `${getNowJSTDate()}-${event.message.id}.jpg`;
      try {
        const putContent = await lineClient.getMessageContent(event.message.id);
        await putImage(putContent, `${IMAGE_DIR}/${imageFileName}`);
        // Todo: サムネイルでもおなじcontentを使い回す(できるなら)
        const thubnailContent = await lineClient.getMessageContent(event.message.id);
        const thumbnail = await createThumbnailFromReadable(thubnailContent, 200);
        await putImage(thumbnail, `${THUMBNAIL_DIR}/${imageFileName}`);
        await replyText(event, "画像を受け取りました！");
      } catch (error) {
        console.log(error);
        await replyText(event, "画像を受け取れませんでした…もう一度送信してみてください");
      }
    }
    else if (event.type == "message") {
      await replyText(event, "すいません、画像以外は対応していません…");
    }
  }

  res.body = "finish";
  return res;
};