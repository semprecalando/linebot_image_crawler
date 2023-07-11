import React, { FC, useEffect, useState } from 'react';
import { CLOUDFRONT_URL, WS_URL } from '../lib/settings';
import { getImageThumbnailList } from '../lib/dynamoAPI';
import { CorkboardImage } from  '../components/CorkboardImage';
import { useWindowSize } from '../lib/useWindowsize';
import { BackGroundImage } from '../components/BackgroundImage';
import ReconnectingWebSocket from 'reconnecting-websocket'
import { ImageConfig } from '../lib/types';
import { createRandomArrayN, getCellPosition, getRandomPosition } from '../lib/utils';

const MAX_IMAGE_NUM = 8;

interface SlideshowImageConfig extends ImageConfig {
  imageName: string
};

const imageNameReplacer = (substring: string) =>
  `${CLOUDFRONT_URL}/thumbnails/${substring}`;

const createCardBord = (newSlideshowImageConfigList: SlideshowImageConfig[], index: number, windowWidth: number, windowHeight: number) => {
  const targetImageConfig = newSlideshowImageConfigList[index];
  const imagePath = imageNameReplacer(targetImageConfig.imageName);
  const rotationAbsoluteDeg = 10;
  const rotationDeg = targetImageConfig.rotation ? targetImageConfig.rotation : Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
  const imagePosition = targetImageConfig.imagePosition ? targetImageConfig.imagePosition : getRandomPosition(windowWidth, windowHeight);
  return (
    <CorkboardImage key={`${imagePath}${rotationDeg}`} imageSrc={imagePath} imagePosition={imagePosition} rotation={rotationDeg} />
  );
};

const SlideshowPage: FC = () => {
  const [thumbnailList, setThumbnailList] = useState<string[]>([]);
  const [slideshowImageConfigList, setSlideshowImageConfigList] = useState<SlideshowImageConfig[]>([]);
  const [count, setCount] = useState<number>(0);
  const [firstFlag, setFirstFlag] = useState<boolean>(true);
  const [width, height] = useWindowSize();

  const getImageDataSet = async () => {
    const thumbnailList = await getImageThumbnailList()
    setThumbnailList(thumbnailList);
  };
  useEffect(() => {
    // 重複防止のため、まつ
    (async () => {
      await getImageDataSet();
    })();
    // Todo: websocketのcustom hook切り出し
    const websocket = new ReconnectingWebSocket(WS_URL);
    // 接続時の処理
    websocket.addEventListener('open', (event) => {
      console.log('connected');
    });
    // 切断時の処理
    websocket.addEventListener('close', (event) => {
      console.log('closed');
    });
    const onMessage = (event: MessageEvent<string>) => {
      console.log(event.data);
      const messageData = JSON.parse(event.data);
      const newThumbnailList = thumbnailList.concat();
      // ダブっていなければ追加（重複受信対策）
      if (messageData.imageName && !thumbnailList.includes(messageData.imageName)) {
        newThumbnailList.push(messageData.imageName);
        setThumbnailList(newThumbnailList);
      }
    }
    websocket.addEventListener('message', onMessage);
    // useEffectのクリーンアップの中で、WebSocketのクローズ
    return () => {
      if (websocket.readyState === 1) { // <-- This is important
        websocket.close();
        websocket.removeEventListener('message', onMessage);
      }
    }
  },[]);

  // Todo: なぜか同じ画像が0番に来る問題の解決（おそらくuseEffectが2回呼ばれている）
  useEffect(() => {
    if(firstFlag && thumbnailList.length > 0) {
      console.log("first");
      setFirstFlag(false);
      const newSlideshowImageConfigList: SlideshowImageConfig[] = [];
      // 表示数以上の画像データがとれた場合、画像をランダムに選択
      const pickedList: string[] = thumbnailList.length <= MAX_IMAGE_NUM ? thumbnailList : createRandomArrayN(thumbnailList, MAX_IMAGE_NUM);
      pickedList.map((thumbnail, index) => {
        const rotationAbsoluteDeg = 10;
        const rotationDeg = Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
        const imagePosition = getCellPosition(width, height, index, MAX_IMAGE_NUM);
        newSlideshowImageConfigList.push({
          imageName: thumbnail,
          imagePosition: imagePosition,
          rotation: rotationDeg
        });
        return null;
      });
      if (thumbnailList.length <= MAX_IMAGE_NUM) {
        const newCount = newSlideshowImageConfigList.length;
        setCount(newCount >= MAX_IMAGE_NUM - 1 ? 0 : newCount);
      }
      console.log(newSlideshowImageConfigList);
      setSlideshowImageConfigList(newSlideshowImageConfigList);
    }
    else if (thumbnailList.length > 0) {
      console.log("second");
      const newSlideshowImageConfigList = [...slideshowImageConfigList];
      const latestThumbnail = thumbnailList.at(-1);
      if (latestThumbnail) {
        const rotationAbsoluteDeg = 10;
        const rotationDeg = Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
        const imagePosition = getCellPosition(width, height, count, MAX_IMAGE_NUM);
        newSlideshowImageConfigList[count] = {
          imageName: latestThumbnail,
          imagePosition: imagePosition,
          rotation: rotationDeg
        };
        console.log(newSlideshowImageConfigList);
        setSlideshowImageConfigList(newSlideshowImageConfigList);
        const newCount = count >= (MAX_IMAGE_NUM - 1) ? 0 : count + 1;
        setCount(newCount);
      }
    }
  },[thumbnailList]);

  return (
    <div>
      <BackGroundImage imageSrc={`${process.env.PUBLIC_URL}/CorkBoardBG.jpg`} />
      {Object.keys(slideshowImageConfigList).map((imageName, index) => createCardBord(slideshowImageConfigList, index, width, height))}
    </div>
  )
  };

export default SlideshowPage;