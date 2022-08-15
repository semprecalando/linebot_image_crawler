import { API } from 'aws-amplify';
import { FaceDetectResult, FaceDetectRecord } from './types';

export const getFaceDetectResults = async () => {
  const apiName = 'accessFaceDetectTable';
  const path = '/facedetect'
  const myInit = {
    // OPTIONAL
    headers: {}, // OPTIONAL
  };
  const apiResult: FaceDetectResult[] = []
  const tables: FaceDetectRecord[] = await API.get(apiName, path, myInit);
  for (const record of tables) {
    const detectResult: FaceDetectResult = {
      imageName: record.imageName.S
    };
    if (record.groom) detectResult.groom = record.groom.N;
    if (record.bride) detectResult.bride = record.bride.N;
    apiResult.push(detectResult);
  }
  return apiResult;
};

export const getImageThumbnailList = async () => {
  const apiName = 'thumbnailList';
  const path = '/thumbnail'
  const myInit = {
    // OPTIONAL
    headers: {}, // OPTIONAL
  };
  const results: string[] = await API.get(apiName, path, myInit);
  return results;
};