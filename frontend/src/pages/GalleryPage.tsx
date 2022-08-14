import React, { FC } from 'react';
import { CONSTELLATIONS, CLOUDFRONT_URL } from '../lib/settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Typography, Grid } from '@mui/material';

const constellationReplacer = (substring: string) =>
  //`${process.env.PUBLIC_URL}/img/constellations/${substring}.jpg`;
  `${CLOUDFRONT_URL}/thumbnails/${substring}.jpg`;
const createImageBox = (constellation: string) => {
  const imagePath = constellationReplacer(constellation);

  return (
    <Grid item key={constellation} xs={12} md={4} sx={{ padding: 3 }}>
      <LazyLoadImage width="100%" src={imagePath} alt={imagePath} />
      <Typography align="center" variant="h5">
        {constellation}
      </Typography>
    </Grid>
  );
};

const GalleryPage: FC = () => (
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
      {CONSTELLATIONS.map((constellation) => createImageBox(constellation))}
    </Grid>
  </>
);

export default GalleryPage;
