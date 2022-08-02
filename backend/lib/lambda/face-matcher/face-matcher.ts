// 特定ユーザの顔が写っているかをrekognitionでスキャンし、結果をdynamoDBに格納する
import { CompareFacesCommand, RekognitionClient, CompareFacesCommandOutput } from "@aws-sdk/client-rekognition";

const FACE_BUCKET_NAME = process.env.FACE_BUCKET_NAME || "";
const IMAGE_DIR = process.env.IMAGE_DIR || "images";
const REGION = process.env.IMAGE_DIR || "ap-northeast-1";

const rekognitionClient = new RekognitionClient({
  region: REGION,
});

export const handler = async (event: any = {}): Promise<any> => {

  console.log(JSON.stringify(event));
  const res = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  }

  const bucketName = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  const brideCheckResult = await rekognitionClient.send(
    new CompareFacesCommand({
      SourceImage: {"S3Object": {"Bucket": `${FACE_BUCKET_NAME}`, "Name": "brides/bride.jpg"}},
      TargetImage: {"S3Object": {"Bucket": `${bucketName}`, "Name": `${key}`}},
      SimilarityThreshold: 80
    })
  );
  console.log(JSON.stringify(brideCheckResult.FaceMatches));
  const groomCheckResult = await rekognitionClient.send(
    new CompareFacesCommand({
      SourceImage: {"S3Object": {"Bucket": `${FACE_BUCKET_NAME}`, "Name": "grooms/groom.jpg"}},
      TargetImage: {"S3Object": {"Bucket": `${bucketName}`, "Name": `${key}`}},
      SimilarityThreshold: 80
    })
  );
  console.log(JSON.stringify(groomCheckResult.FaceMatches));
  res.body = "finish";
  return await res;
};