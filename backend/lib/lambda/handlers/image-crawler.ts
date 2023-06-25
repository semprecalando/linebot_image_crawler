import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import * as line from "@line/bot-sdk";
import { TextMessage, WebhookRequestBody } from "@line/bot-sdk";
import { createThumbnailFromReadable, getNowJSTDate, Response } from "./utils";
import { Readable } from "stream";

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || "";
const LINE_ACCESS_SECRET = process.env.LINE_ACCESS_SECRET || "";
const REGION = process.env.REGION || "ap-northeast-1";
const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME || "";
const IMAGE_DIR = process.env.IMAGE_DIR || "images";
const THUMBNAIL_DIR = process.env.IMAGE_DIR || "thumbnails";

const CONFIG = {
  channelAccessToken:LINE_ACCESS_TOKEN,
  channelSecret: LINE_ACCESS_SECRET,
}
const lineClient = new line.Client(CONFIG);

const s3Client = new S3Client({
  region: REGION
});

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
};

const checkSignature = (event: any) => {
  // Todo: signatureAttributeの大文字小文字を区別しない (予告なくX-Line-Signatureなどに変わる可能性がある)
  const signature = event["headers"]["x-line-signature"];
  if (!line.validateSignature(event["body"], LINE_ACCESS_SECRET, signature)) {
    throw new line.SignatureValidationFailed("signature validation failed", signature);
  }
};

const processWebhookEvents = async (events: line.WebhookEvent[]) => {
  const recieveStatus = {
    isRecieveImage: false,
    isRecieveText: false,
    isRecieveOther: false,
    isRecieveImageError: false
  };
  for (const event of events) {
    console.log(event)
    // recieveStatusでメッセージタイプの重複を管理し、各ステータスごとにメッセージを返却するのは一度だけとする
    // Todo: dynamoとimageSet.idを利用した連投画像ステータス管理（現状は連投画像が分割して送信された場合、分割された数だけメッセージを返してしまう）
    if (event.type == "message" && event.message.type == "text" && !recieveStatus.isRecieveText) {
      await replyText(event, "話しかけてくれてありがとうございます！でもお返事はできないんです…");
      recieveStatus.isRecieveText = true;
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

        // 複数画像がある場合、最後のIDのもの（index=totalのもの）にのみ反応する
        const imageSet = event.message.imageSet
        if (!recieveStatus.isRecieveImage && imageSet == undefined) await replyText(event, "画像を受け取りました！");
        else if (imageSet && imageSet.index == imageSet.total) await replyText(event, "画像を受け取りました！");
        recieveStatus.isRecieveImage = true;

        // chatを送る
      } catch (error) {
        console.log(error);
        if (!recieveStatus.isRecieveImageError) {
          await replyText(event, "画像の一部を受け取れませんでした…もう一度送信してみてください");
        }
        recieveStatus.isRecieveImageError = true;
      }
    }
    else if (event.type == "message" && !recieveStatus.isRecieveOther) {
      await replyText(event, "画像以外は対応していないんです…すいません");
      recieveStatus.isRecieveOther = true;
    }
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
  await processWebhookEvents(webhookEvent.events);

  res.body = "finish";
  return res;
};