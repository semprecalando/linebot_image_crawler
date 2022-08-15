import React, { FC, useEffect, useState } from 'react';
import { CLOUDFRONT_URL } from '../lib/settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Typography, Grid } from '@mui/material';
import { getImageThumbnailList, getFaceDetectResults } from '../lib/dynamoAPI';
import FaceFilter from '../components/FaceFilter';
import { FaceDetectResult } from '../lib/types';

// Todo: カスタムフックとして切り出す
// Todo: 作ったリストをチェックボックスの状態とセットでメモ化する

const imageNameReplacer = (substring: string) =>
  `${CLOUDFRONT_URL}/thumbnails/${substring}`;
const createImageBox = (name: string) => {
  const imagePath = imageNameReplacer(name);

  return (
    <Grid item key={name} xs={6} md={3} sx={{ padding: 3 }}>
      <LazyLoadImage width="100%" src={imagePath} alt={imagePath} />
      <Typography align="center" variant="h5">
      </Typography>
    </Grid>
  );
};

const filterThumbnailList = (
      baseThumbnailList: string[],
      faceDetectResults: FaceDetectResult[],
      isGroom: boolean,
      isBride: boolean) => {
  if (!isGroom && !isBride) return baseThumbnailList;
  const newList: string[] = [];
  for (const faceDetectResult of faceDetectResults) {
    if (isGroom && faceDetectResult.groom) newList.push(faceDetectResult.imageName);
    else if (isBride && faceDetectResult.bride) newList.push(faceDetectResult.imageName);
  }
  return newList;
}

const GalleryPage: FC = () => {
  const [imageThumbnailList, setImageThumbnailList] = useState<string[]>([]);
  const [viewThumbnailList, setViewImageThumbnailList] = useState<string[]>([]);
  const [faceDetectResults, setFaceDetectResults] = useState<FaceDetectResult[]>([]);
  const [isGroom, setIsGroom] = useState<boolean>(false);
  const [isBride, setIsBride] = useState<boolean>(false);

  const getImageDataSet = async () => {
    const thumbnailList = await getImageThumbnailList()
    setImageThumbnailList(thumbnailList);
    setViewImageThumbnailList(thumbnailList);
    setFaceDetectResults(await getFaceDetectResults());
  };
  useEffect(() => {
    getImageDataSet();
  },[]);

  useEffect(() => {
    setViewImageThumbnailList(
      filterThumbnailList(imageThumbnailList, faceDetectResults, isGroom, isBride)
    );
  },[isGroom, isBride]);
  return (
    <>
      <Typography
        gutterBottom
        align="center"
        variant="h3"
        component="div"
        sx={{ padding: 3 }}
      >
        Image Gallery
      </Typography>
      <FaceFilter handleGroomChange={setIsGroom} handleBrideChange={setIsBride} />
      <Grid container alignItems="center" justifyContent="center">
        {viewThumbnailList.map((thumbnail) => createImageBox(thumbnail))}
      </Grid>
    </>
  )
  };

export default GalleryPage;
