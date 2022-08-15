import { API } from 'aws-amplify';
import { FaceDetectResult } from './types';

export const getFaceDetectResults = async () => {
  const apiName = 'accessFaceDetectTable';
  const path = '/'
  const myInit = {
    // OPTIONAL
    headers: {}, // OPTIONAL
  };
  const results: FaceDetectResult[] = await API.get(apiName, path, myInit);
  return results;
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