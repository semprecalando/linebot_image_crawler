import React, { FC, useEffect, useState } from 'react';
import { CLOUDFRONT_URL } from '../lib/settings';
import { getImageThumbnailList } from '../lib/dynamoAPI';
import { CorkboardImage } from  '../components/CorkboardImage';
import { useWindowSize } from '../lib/useWindowsize';
import { BackGroundImage } from '../components/BackgroundImage';

const imageNameReplacer = (substring: string) =>
  `${CLOUDFRONT_URL}/thumbnails/${substring}`;
const createCardBord = (name: string, width:number, height: number) => {
  const imagePath = imageNameReplacer(name);
  const rotationAbsoluteDeg = 10;
  const rotationDeg = Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;

  return (
    <CorkboardImage key={imagePath} imageSrc={imagePath} imagePosition={getRandomPosition(width, height)} rotation={rotationDeg} />
  );
};

const getRandomPosition = (maxX: number, maxY: number) => {
  // 2つの値の間の乱数を得るのは Math.random() * (max - min) + min;
  const x = Math.random() * (maxX * 0.8 - maxX * 0.01) + maxX * 0.05;
  const y = Math.random() * (maxY * 0.8 - maxY * 0.1) + maxY * 0.1;
  return { x, y };
};

const CorkboardPage: FC = () => {
  const [viewThumbnailList, setViewImageThumbnailList] = useState<string[]>([]);
  const [width, height] = useWindowSize();
  // 「表示済み」リスト作る→リストにないやつならcカードを追加する

  const getImageDataSet = async () => {
    const thumbnailList = await getImageThumbnailList()
    setViewImageThumbnailList(thumbnailList);
  };
  useEffect(() => {
    getImageDataSet();
  },[]);

  return (
    <div>
      <BackGroundImage imageSrc={`${process.env.PUBLIC_URL}/CorkBoardBG.jpg`} />
      {viewThumbnailList.map((thumbnail) => createCardBord(thumbnail, width, height))}
    </div>
  )
  };

export default CorkboardPage;

//       <img src={`${process.env.PUBLIC_URL}/CorkBoardBG.jpg`} alt='' width={'100%'} height={'100%'}/>
