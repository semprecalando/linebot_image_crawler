export type FaceDetectRecord = {
  imageName: {S: string},
  groom?: {N: number},
  bride?: {N: number}
};

export type FaceDetectResult = {
  imageName: string,
  groom?: number,
  bride?: number
};