export declare class LZWDictionary {
  private dicTable;
  private dicSize;
  private curPos;
  constructor(maxBits: number);
  getEntry(pos: number): number[] | null;
  isFull(): boolean;
  getCurPos(): number;
  addEntry(entry: number[]): number;
}
export default LZWDictionary;
