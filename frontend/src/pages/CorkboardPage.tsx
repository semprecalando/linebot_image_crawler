import React, { FC, useEffect, useRef, useState } from 'react';
import { CLOUDFRONT_URL, WS_URL } from '../lib/settings';
import { getImageThumbnailList } from '../lib/dynamoAPI';
import { CorkboardImage } from  '../components/CorkboardImage';
import { useWindowSize } from '../lib/useWindowsize';
import { BackGroundImage } from '../components/BackgroundImage';
import ReconnectingWebSocket from 'reconnecting-websocket'
import { ImageConfig } from '../lib/types';
import { getWindowRandomPosition } from '../lib/utils';

interface ImageConfigDict {
  [imageName: string]: ImageConfig
};

const imageNameReplacer = (substring: string) =>
  `${CLOUDFRONT_URL}/thumbnails/${substring}`;

const createCardBord = (imageName: string, windowWidth: number, windowHeight: number, imageConfigDict: ImageConfigDict) => {
  const imagePath = imageNameReplacer(imageName);
  const rotationAbsoluteDeg = 10;
  const rotationTmpDeg = Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
  const rotationDeg = imageConfigDict[imageName].rotation ?? rotationTmpDeg;
  const imagePosition = imageConfigDict[imageName].imagePosition ?? getWindowRandomPosition(windowWidth, windowHeight);
  return (
    <CorkboardImage key={imagePath} imageSrc={imagePath} imagePosition={imagePosition} rotation={rotationDeg} />
  );
};

const CorkboardPage: FC = () => {
  const [viewThumbnailList, setViewImageThumbnailList] = useState<string[]>([]);
  const [imageConfigDict, setImageConfigDict] = useState<ImageConfigDict>({});
  const [width, height] = useWindowSize();

  const getImageDataSet = async () => {
    const thumbnailList = await getImageThumbnailList()
    setViewImageThumbnailList(thumbnailList);
  };
  useEffect(() => {
    getImageDataSet();
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
      const newThumbnailList = viewThumbnailList.concat();
      if (messageData.imageName && !viewThumbnailList.includes(messageData.imageName)) {
        newThumbnailList.push(messageData.imageName);
        setViewImageThumbnailList(newThumbnailList);
      }
    }
    //websocket.addEventListener('message', onMessage);
    // useEffectのクリーンアップの中で、WebSocketのクローズ
    return () => {
      if (websocket.readyState === 1) { // <-- This is important
        websocket.close();
        websocket.removeEventListener('message', onMessage);
      }
    }
  },[]);

  // Todo: 画面サイズを変更した際のレスポンシブ対応
  useEffect(() => {
    const newImageConfigDict: ImageConfigDict = Object.assign({}, imageConfigDict);
    viewThumbnailList.map((thumbnail) => {
      if (!imageConfigDict.hasOwnProperty(thumbnail)) {
        // まだconfigに存在していないキーの場合、位置情報を追加する
        const rotationAbsoluteDeg = 10;
        const rotationDeg = Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
        const imagePosition = getWindowRandomPosition(width, height);
        newImageConfigDict[thumbnail] = {
          imagePosition: imagePosition,
          rotation: rotationDeg
        };
      }
      return;
    });
    setImageConfigDict(newImageConfigDict);
  },[viewThumbnailList]);

  return (
    <div>
      <BackGroundImage imageSrc={`${process.env.PUBLIC_URL}/CorkBoardBG.jpg`} />
      {Object.keys(imageConfigDict).map((imageName, index) => createCardBord(imageName, width, height, imageConfigDict))}
    </div>
  )
  };

export default CorkboardPage;