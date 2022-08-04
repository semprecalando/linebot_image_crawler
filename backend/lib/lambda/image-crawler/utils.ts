import { Readable, Stream } from "stream";
import * as sharp from "sharp";

export type Response = {
  isBase64Encoded: Boolean,
  statusCode: Number,
  headers: {},
  body: String
}

export const stream2buffer = async (stream: Stream): Promise<Buffer> => {
  return new Promise < Buffer > ((resolve, reject) => {
      const _buf = Array < any > ();
      stream.on("data", chunk => _buf.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(_buf)));
      stream.on("error", err => reject(`error converting stream - ${err}`));
  });
}

export const createThumbnailFromReadable = async(readable: Readable, heightPixel: number) => {
  const result = await sharp(await stream2buffer(readable)).resize( {height: heightPixel} ).toBuffer()
  return result;
}

export const createThumbnailFromFile = async(tmpFilePath: string, heightPixel: number) => {
  const result = await sharp(tmpFilePath).resize( {height: heightPixel} ).toBuffer()
  return result;
}