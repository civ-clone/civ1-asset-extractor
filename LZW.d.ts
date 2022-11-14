export declare class LZW {
  static parseByteStreamToIndexes(
    binFile: {
      getUByte: () => number;
    },
    remainingCodedBytes: number,
    uByteMode: number
  ): number[];
  static decode(inputData: any, dicIndexMaxBits: number): number[];
  static RLEDecode(byteArr: number[]): number[];
}
export default LZW;
