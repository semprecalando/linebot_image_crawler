import gql from 'graphql-tag';
import AWSAppSyncClient from "aws-appsync";
// サーバサイドでfetch(appsync内部で利用)を使うためのimport
import 'isomorphic-fetch';
import { FaceRecord, Response } from './utils';

const REGION = process.env.REGION || "ap-northeast-1";
const CHAT_URL = process.env.CHAT_URL || "CHAT_URL";
const CHAT_CHANNEL = process.env.CHAT_CHANNEL || "channel00";
const CHAT_API_KEY = process.env.CHAT_API_KEY || "CHAT_API_KEY";

const appSyncClient = new AWSAppSyncClient({
  url: CHAT_URL,
  region: REGION,
  auth: {
    type: "API_KEY",
    apiKey: CHAT_API_KEY
  },
  disableOffline: true,
});

// Todo: requireでimportする？

const createPublishMutation = (record: FaceRecord) => {
  console.log("createPublishMutation");
  const publishMutation = gql(`mutation PublishData {
    publish(data: "${JSON.stringify(record).replace(/"/g, '\\"')}", name: "${CHAT_CHANNEL}") {
      name
      data
    }
  }`);
  return publishMutation;
};

const createParams = (record: FaceRecord) => {
  const params = {
    "data": JSON.stringify(record),
    "name": CHAT_CHANNEL
  }
  return params;
};

export const publishMutate = async (record: FaceRecord) => {
  try {
    console.log("mutate");
    await appSyncClient.mutate({
      mutation: createPublishMutation(record)
    });
    console.log("success")
  } catch (err) {
    console.log("mutate error");
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