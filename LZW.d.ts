export declare class LZW {
  static parseByteStreamToIndexes(
    binFile: {
      getUByte: () => number;
    },
    remainingCodedBytes: number,
    ubyte_mode: number
  ): number[];
  static decode(inputData: any, dicIndexMaxBits: number): number[];
  static RLEDecode(byteArr: number[]): number[];
}
export default LZW;
