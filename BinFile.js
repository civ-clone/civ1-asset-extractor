"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinFile = void 0;
class BinFile {
    constructor() {
        this.blob = null;
        this.ptr = -1;
    }
    fromString(content, callback) {
        this.blob = content;
        this.ptr = 0;
        this.decode(callback);
    }
    getUByte() {
        return this.blob.charCodeAt(this.ptr++);
    }
    getUShort() {
        const b1 = this.getUByte(), b2 = this.getUByte();
        return (b2 << 8) + b1;
    }
    getShort() {
        return ((this.getUShort() + 0x8000) % 0x10000) - 0x8000;
    }
    getString(length) {
        const start = this.ptr;
        this.ptr += length;
        return this.blob.substr(start, length);
    }
    decode(callback) {
        if (this.blob === null) {
            console.warn('file has not been loaded!');
            return;
        }
        console.warn('The decode function should be overwritten');
        if (callback)
            callback();
    }
}
exports.BinFile = BinFile;
exports.default = BinFile;
//# sourceMappingURL=BinFile.js.map