export type BiblioCover = {
  itemId: number;
  title: string;
  abst: string;
  imageUrl: string;
  author: string;
  starryDate: string;
  constellation?: string[];
  place: string;
};

export type BiblioContent = {
  itemId: number;
  viewTitle: string;
  imageUrl: string;
  mainText: string;
  constellation?: string[];
  musics?: string[];
};

export type FaceDetectResult = {
  name: string,
  groom?: boolean,
  bride?: boolean
};