import React, { FC } from 'react';
import { CSSProperties } from 'react';
import '../styles/style.css';

export interface CorkboardImageProps {
  imageSrc: string;
  imagePosition: { x: number; y: number };
  rotation: number;
  maxSize?: number;
}

export const CorkboardImage: FC<CorkboardImageProps> = ({ imageSrc, imagePosition, rotation, maxSize }: CorkboardImageProps) => {
  // 画像サイズの初期値は200pxとする
  const imageMaxSize = maxSize ? maxSize : 200;
  const imageStyle: CSSProperties = {
    position: 'absolute',
    transformOrigin: 'top left',
    left: `${imagePosition.x}px`,
    top: `${imagePosition.y}px`,
    transform: `rotate(${rotation}deg)`,
    objectFit: 'contain', // アスペクト比を保ったままリサイズ
    width: `${imageMaxSize}px`, // 親要素に合わせてリサイズ
    height: `${imageMaxSize}px`
  };

  return <img src={imageSrc} alt='' style={imageStyle} className='fadeInAnimation' />;
};