export class LZWDictionary {
  private dicTable: number[][] | null[] = [];
  private dicSize: number;
  private curPos: number;

  constructor(maxBits: number) {
    this.dicTable = [];
    this.dicSize = 0x1 << maxBits;

    for (let i = 0; i < this.dicSize; i++) {
      if (i < 256) {
        this.dicTable[i] = [i];
      } else {
        this.dicTable[i] = null;
      }
    }

    this.curPos = 0x0101;
  }

  getEntry(pos: number): number[] | null {
    return pos < this.curPos ? this.dicTable[pos] : null;
  }

  isFull() {
    return this.curPos === this.dicTable.length;
  }

  getCurPos() {
    return this.curPos;
  }

  addEntry(entry: number[]) {
    if (this.curPos < this.dicTable.length) {
      this.dicTable[this.curPos] = entry;
      this.curPos++;
    }

    return this.curPos - 1;
  }
}

export default LZWDictionary;
