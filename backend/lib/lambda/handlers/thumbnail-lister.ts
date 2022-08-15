import { ListObjectsCommand, ListObjectsCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { Response } from "./utils";

const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME || "";
const THUMBNAIL_DIR = process.env.IMAGE_DIR || "thumbnails";

const s3Client = new S3Client({
  region: "ap-northeast-1"
})

const createObjectList = (response: ListObjectsCommandOutput) => {
  const res: string[] = []
  if (!response.Contents) return res;
  for (const content of response.Contents) {
    // キーの最後を取得
    const imageName = content.Key?.split("/").slice(-1)[0];
    if (imageName) res.push(imageName);
  }
  return res;
};


export const handler = async (event: any = {}): Promise<any> => {

  const res: Response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  }

  let objectNameList: string[] = [];
  let isTruncated = false;

  const command = new ListObjectsCommand({
    Bucket: IMAGE_BUCKET_NAME,
    Prefix: `${THUMBNAIL_DIR}/`
  });
  const response = await s3Client.send(command);
  isTruncated = response.IsTruncated ? response.IsTruncated : false;
  objectNameList = objectNameList.concat(createObjectList(response));

  // 一度にオブジェクトをとれなかった場合の処理
  while (isTruncated) {
    const nextMarker = response.NextMarker ? response.NextMarker: "";
    const nextCommand = new ListObjectsCommand({
      Bucket: IMAGE_BUCKET_NAME,
      Prefix: `${THUMBNAIL_DIR}/`,
      Marker: nextMarker
    });
    const nextResponse = await s3Client.send(nextCommand);
    isTruncated = nextResponse.IsTruncated ? nextResponse.IsTruncated : false;
    objectNameList = objectNameList.concat(createObjectList(nextResponse));
  }

  res.body = JSON.stringify(objectNameList);
  console.log(JSON.stringify(res));
  return res;
};