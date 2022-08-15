import React, { Dispatch, FC, SetStateAction } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { Grid, Typography } from '@mui/material';

type FaceFilterProps = {
  handleGroomChange: Dispatch<SetStateAction<boolean>>,
  handleBrideChange: Dispatch<SetStateAction<boolean>>
};

const FaceFilter: FC<FaceFilterProps> = (props) => {
  const { handleGroomChange, handleBrideChange } = props;

  const onGroomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleGroomChange(event.target.checked);
  };
  const onBrideChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleBrideChange(event.target.checked);
  };

  return (
    <Grid container alignItems="center" justifyContent="center">
      <Grid item key={'groomCheckBoxSet'} xs={4} md={2} sx={{ padding: 3 }}>
          <Checkbox onChange={onGroomChange}/>
        <Typography align="center" variant="h5">groom</Typography>
      </Grid>
      <Grid item key={'brideCheckBoxSet'} xs={4} md={2} sx={{ padding: 3 }}>
        <Checkbox onChange={onBrideChange}/>
        <Typography align="center" variant="h5">bride</Typography>
      </Grid>
    </Grid>
  );
};

export default FaceFilter;
