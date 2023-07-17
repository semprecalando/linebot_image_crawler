import React, { FC, useEffect, useRef, useState } from 'react';
import { CLOUDFRONT_URL, WS_URL } from '../lib/settings';
import { getImageThumbnailList } from '../lib/dynamoAPI';
import { CorkboardImage } from  '../components/CorkboardImage';
import { useWindowSize } from '../lib/useWindowsize';
import { BackGroundImage } from '../components/BackgroundImage';
import ReconnectingWebSocket from 'reconnecting-websocket'
import { ImageConfig } from '../lib/types';
import { Queue, createRandomArrayN, getCellPosition, getRandomPosition, useTimer } from '../lib/utils';

const MAX_IMAGE_NUM = 8;
// Todo: PX_SIZEを可変にする
const IMAGE_PX_SIZE = 350;
const MAX_REFRESH_COUNT = 24;

interface SlideshowImageConfig extends ImageConfig {
  imageName: string
};

const imageNameReplacer = (substring: string) =>
  `${CLOUDFRONT_URL}/images/${substring}`;

const createCardBord = (newSlideshowImageConfigList: SlideshowImageConfig[], index: number, windowWidth: number, windowHeight: number) => {
  const targetImageConfig = newSlideshowImageConfigList[index];
  const imagePath = imageNameReplacer(targetImageConfig.imageName);
  const rotationAbsoluteDeg = 10;
  const rotationDeg = targetImageConfig.rotation ? targetImageConfig.rotation : Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
  const imagePosition = targetImageConfig.imagePosition ? targetImageConfig.imagePosition : getRandomPosition(windowWidth, windowHeight);
  return (
    <CorkboardImage key={`${imagePath}${rotationDeg}`} imageSrc={imagePath} imagePosition={imagePosition} rotation={rotationDeg} maxSize={IMAGE_PX_SIZE} />
  );
};

const SlideshowPage: FC = () => {
  const [thumbnailList, setThumbnailList] = useState<string[]>([]);
  const [thumbnailWsQueue, setThumbnailWsQueue] = useState<Queue<string>>(new Queue<string>());
  const [slideshowImageConfigList, setSlideshowImageConfigList] = useState<SlideshowImageConfig[]>([]);
  const [oldestImageId, setOldestImageId] = useState<number>(0);
  const notRefreshCountRef = useRef<number>(0);
  const [firstFlag, setFirstFlag] = useState<boolean>(true);
  const [width, height] = useWindowSize();

  const onTimerEnd = () => {
    setTimeout(() => {
      if (thumbnailWsQueue.size() > 0) {
        // キューが空でなければ1つデキューし、新しいthumbnailListを作る
        const newImage = thumbnailWsQueue.dequeue();
        const newThumbnailList = thumbnailList.concat();
        if (newImage !== undefined && !thumbnailList.includes(newImage)) {
          newThumbnailList.push(newImage);
          setThumbnailList(newThumbnailList);
          // 何連続キューが空だったかのカウンタをリセット
          notRefreshCountRef.current = 0;
        }
      } else {
        const newCount = notRefreshCountRef.current + 1;
        console.log("count up" + newCount);
        notRefreshCountRef.current = newCount;
      }
    });
  }

  const { second, startTimer, stopTimer, resetAndStart } = useTimer(5, onTimerEnd);

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
      const messageData = JSON.parse(event.data);
      // ダブっていなければ追加（重複受信対策）
      if (messageData.imageName && !thumbnailList.includes(messageData.imageName) && !thumbnailWsQueue.toArray().includes(messageData.imageName)) {
        thumbnailWsQueue.enqueue(messageData.imageName);
      }
    }
    websocket.addEventListener('message', onMessage);
    // 自動でリセットするタイマーを起動
    startTimer();
    // useEffectのクリーンアップの中で、WebSocketのクローズ
    return () => {
      if (websocket.readyState === 1) { // <-- This is important
        websocket.close();
        websocket.removeEventListener('message', onMessage);
        stopTimer();
      }
    }
  },[]);

  const refreshImage = () => {
    console.log("all refresh");
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
      const nextDaleteImageId = newSlideshowImageConfigList.length;
      setOldestImageId(nextDaleteImageId >= MAX_IMAGE_NUM - 1 ? 0 : nextDaleteImageId);
    }
    setSlideshowImageConfigList(newSlideshowImageConfigList);
    notRefreshCountRef.current = 0;
  }

  // ランダムに画像を総入れ替え
  useEffect(() => {
    if(firstFlag && thumbnailList.length > 0) {
      refreshImage();
    }
    else if (thumbnailList.length > 0) {
      const newSlideshowImageConfigList = [...slideshowImageConfigList];
      const latestThumbnail = thumbnailList.at(-1);
      if (latestThumbnail && latestThumbnail) {
        console.log("change image");
        const rotationAbsoluteDeg = 10;
        const rotationDeg = Math.random() * (rotationAbsoluteDeg - (-rotationAbsoluteDeg)) - rotationAbsoluteDeg;
        const imagePosition = getCellPosition(width, height, oldestImageId, MAX_IMAGE_NUM);
        newSlideshowImageConfigList[oldestImageId] = {
          imageName: latestThumbnail,
          imagePosition: imagePosition,
          rotation: rotationDeg
        };
        setSlideshowImageConfigList(newSlideshowImageConfigList);
        const nextDaleteImageId = oldestImageId >= (MAX_IMAGE_NUM - 1) ? 0 : oldestImageId + 1;
        setOldestImageId(nextDaleteImageId);
      }
    }
  },[thumbnailList]);

  useEffect(() => {
    // Todo: refreshImageをした際に、一度でもキューからデータ更新していると画像が一枚だけになる
    if (notRefreshCountRef.current >= MAX_REFRESH_COUNT) {
      setThumbnailWsQueue(new Queue<string>());
      refreshImage();
      notRefreshCountRef.current = 0;
    }
  }, [notRefreshCountRef.current]);

  return (
    <div>
      <BackGroundImage imageSrc={`${process.env.PUBLIC_URL}/CorkBoardBG.jpg`} />
      {Object.keys(slideshowImageConfigList).map((imageName, index) => createCardBord(slideshowImageConfigList, index, width, height))}
    </div>
  )
  };

export default SlideshowPage;