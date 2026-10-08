import BinFile from './BinFile';
export declare type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};
export declare class PicImage extends BinFile {
  private palette;
  private palette16;
  private imageData;
  private imageHeight;
  private imageWidth;
  private byteMode;
  decode(callback: (...args: any[]) => any): void;
  getPaletteData(): void;
  getX0ImageData(length: number): void;
  getX1ImageData(length: number): void;
  draw(
    ctx: CanvasRenderingContext2D,
    destinationX?: number,
    destinationY?: number
  ): void;
  getColour(index: number): RGBA;
  getPixel(x: number, y: number): number;
}
export default PicImage;
