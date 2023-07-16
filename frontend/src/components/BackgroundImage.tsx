import React, { FC } from 'react';

export interface BackGroundImageProps {
  imageSrc: string;
}

// Todo: 画像のアスペクト比を可変にする（どのサイズでも画面いっぱいコルクボードにする）
export const BackGroundImage: FC<BackGroundImageProps> = ({ imageSrc }: BackGroundImageProps) => {

  return (
    <div>
      <img src={`${process.env.PUBLIC_URL}/CorkBoardBG.jpg`}
      alt='' width={'100%'} height={'100%'} />
    </div>
  );
};