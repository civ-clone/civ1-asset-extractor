export declare class BinFile {
  private blob;
  private ptr;
  fromString(content: string, callback: (...args: any[]) => any): void;
  getUByte(): number;
  getUShort(): number;
  getShort(): number;
  getString(length: number): string;
  decode(callback: (...args: any[]) => any): void;
}
export default BinFile;
