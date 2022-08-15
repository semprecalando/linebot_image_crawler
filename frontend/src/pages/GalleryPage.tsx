import React, { FC, useEffect, useState } from 'react';
import { CLOUDFRONT_URL } from '../lib/settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Typography, Grid } from '@mui/material';
import { getImageThumbnailList } from '../lib/dynamoAPI';

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

const GalleryPage: FC = () => {
  const [imageThumbnailList, setImageThumbnailList] = useState<string[]>([]);
  const getImages = async () => {
    setImageThumbnailList(await getImageThumbnailList());
  };
  useEffect(() => {
    console.log("effect");
    getImages();
  },[]);

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
      <Grid container alignItems="center" justifyContent="center">
        {imageThumbnailList.map((thumbnail) => createImageBox(thumbnail))}
      </Grid>
    </>
  )
  };

export default GalleryPage;
