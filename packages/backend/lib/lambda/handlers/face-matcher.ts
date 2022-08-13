// 特定ユーザの顔が写っているかをrekognitionでスキャンし、結果をdynamoDBに格納する
import { CompareFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { DynamoDBClient, PutItemCommand, PutItemInput } from "@aws-sdk/client-dynamodb";

const FACE_BUCKET_NAME = process.env.FACE_BUCKET_NAME || "";
const TABLE_NAME = process.env.TABLE_NAME || "";
const REGION = process.env.REGION || "ap-northeast-1";

const rekognitionClient = new RekognitionClient({
  region: REGION,
});
const dynamoDBClient = new DynamoDBClient({
  region: REGION,
})

type FaceRecord = {
  imageName: string ,
  bride?: number,
  groom?: number
}

const writeRecord = async (record: FaceRecord) => {
  const input: PutItemInput = {
    TableName: TABLE_NAME,
    Item: {
      imageName: { S: record.imageName }
    }
  }
  if (input.Item && record.bride !== undefined) input.Item.bride = { N: `${record.bride}` };
  if (input.Item && record.groom !== undefined) input.Item.groom = { N: `${record.groom}` };
  console.log(JSON.stringify(input));
  const data = await dynamoDBClient.send(new PutItemCommand(input));
  console.log(JSON.stringify(data));
}

const compareFaces = async (sourceName: string, targetBucketName: string, targetKey: string) => {
  const result = await rekognitionClient.send(
    new CompareFacesCommand({
      SourceImage: {"S3Object": {"Bucket": `${FACE_BUCKET_NAME}`, "Name": `${sourceName}`}},
      TargetImage: {"S3Object": {"Bucket": `${targetBucketName}`, "Name": `${targetKey}`}},
      SimilarityThreshold: 80
    })
  );
  console.log(JSON.stringify(result.FaceMatches));
  return result;
}

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

  const record: FaceRecord = {
    // キーの最後を取得
    imageName: key.split("/").slice(-1)[0]
  }
  const brideCheckResult = await compareFaces("brides/bride.jpg", bucketName, key);
  if (brideCheckResult.FaceMatches?.length) {
    record.bride = 1;
  }
  const groomCheckResult = await compareFaces("grooms/groom.jpg", bucketName, key);
  if (groomCheckResult.FaceMatches?.length) {
    record.groom = 1;
  }

  if (record.bride !== undefined || record.groom !== undefined) {
    await writeRecord(record);
  }

  res.body = "finish";
  return await res;
};