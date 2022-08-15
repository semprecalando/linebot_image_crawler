import React, { FC, useEffect, useState } from 'react';
import { CLOUDFRONT_URL } from '../lib/settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Typography, Grid } from '@mui/material';
import { getImageThumbnailList } from '../lib/dynamoAPI';
import FaceFilter from '../components/FaceFilter';

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

// 全部入りの表示リストと、現在の表示リストを用意
// groom/brideにチェックを入れる→全部入りの表示リストをフィルタして新しい表示リストを作る
// (appendix)作ったリストはチェックボックスの状態とセットでメモ化する
// チェックボックスがどちらもONになっていない場合、全部入りの表示リストを現在の表示リストにする
// 必要なstate→全部入りリスト/現在の表示リスト/groomとbrideのチェックボックスの状態

const GalleryPage: FC = () => {
  const [imageThumbnailList, setImageThumbnailList] = useState<string[]>([]);
  const [isGroom, setIsGroom] = useState<boolean>(false);
  const [isBride, setIsBride] = useState<boolean>(false);

  const getImages = async () => {
    setImageThumbnailList(await getImageThumbnailList());
  };
  useEffect(() => {
    console.log("effect");
    getImages();
  },[]);

  useEffect(() => {
    console.log(`groom: ${isGroom}, bride: ${isBride}`);
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
        {imageThumbnailList.map((thumbnail) => createImageBox(thumbnail))}
      </Grid>
    </>
  )
  };

export default GalleryPage;
