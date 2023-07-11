import React, { FC } from 'react';
import { CSSProperties } from 'react';
import '../styles/style.css';

export interface CorkboardImageProps {
  imageSrc: string;
  imagePosition: { x: number; y: number };
  rotation: number;
}

export const CorkboardImage: FC<CorkboardImageProps> = ({ imageSrc, imagePosition, rotation }: CorkboardImageProps) => {
  // Todo: 画像サイズ調整
  const imageStyle: CSSProperties = {
    position: 'absolute',
    transformOrigin: 'top left',
    left: `${imagePosition.x}px`,
    top: `${imagePosition.y}px`,
    transform: `rotate(${rotation}deg)`
  };

  return <img src={imageSrc} alt='' style={imageStyle} className='fadeInAnimation' />;
};