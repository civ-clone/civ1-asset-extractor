"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LZWDictionary = void 0;
class LZWDictionary {
    constructor(maxBits) {
        this.dicTable = [];
        this.dicTable = [];
        this.dicSize = 0x1 << maxBits;
        for (let i = 0; i < this.dicSize; i++) {
            if (i < 256) {
                this.dicTable[i] = [i];
            }
            else {
                this.dicTable[i] = null;
            }
        }
        this.curPos = 0x0101;
    }
    getEntry(pos) {
        return pos < this.curPos ? this.dicTable[pos] : null;
    }
    isFull() {
        return this.curPos === this.dicTable.length;
    }
    getCurPos() {
        return this.curPos;
    }
    addEntry(entry) {
        if (this.curPos < this.dicTable.length) {
            this.dicTable[this.curPos] = entry;
            this.curPos++;
        }
        return this.curPos - 1;
    }
}
exports.LZWDictionary = LZWDictionary;
exports.default = LZWDictionary;
//# sourceMappingURL=LZWDictionary.js.map