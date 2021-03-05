"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LZW = void 0;
const LZWDictionary_1 = require("./LZWDictionary");
class LZW {
    //Extracts a series of integers from the byte array
    static parseByteStreamToIndexes(binFile, remainingCodedBytes, ubyte_mode) {
        const parsedIndexes = []; //ArrayList<Integer> parsedIndexes = new ArrayList<Integer>();
        let usableBits = 0, usableBitCount = 0, indicatorLength = 1 /* to increment with ++; rule is that 8+indicatorLength must be <= ubyte_mode, otherwise reset */, indicatorFlag = 0x001 /* to increment with <<=1 followed by |= 1 */, nextThreshold = 0x0100 /*256*/ /* to increment with <<=1, or *=2 */, decodedCounter = 0, index = 0;
        while (remainingCodedBytes > 0) {
            /* get enough coded bits to work with */
            while (usableBitCount < 8 + indicatorLength) {
                usableBits |= binFile.getUByte() << usableBitCount;
                remainingCodedBytes--;
                usableBitCount += 8;
            }
            /* decode bytes and indicators */
            while (usableBitCount >= 8 + indicatorLength) {
                //Builds out a bit screen that is of size 8 + the number of indicator bits and ors it with current set of usable bits
                index = usableBits & (((indicatorFlag << 8) & 0xff00) | 0x00ff);
                usableBits >>= 8 + indicatorLength; //Right-shift out the used bits
                usableBitCount -= 8 + indicatorLength; //Decrement the usableBitCount by the number of bits used
                decodedCounter++; //Keep track of how many things we have decoded to ensure threshold isn't reached
                if (decodedCounter == nextThreshold) {
                    //If threshold is reached...
                    decodedCounter = 0;
                    indicatorLength += 1; // to increment with ++; rule is that 8+indicatorLength must be <= ubyte_mode, otherwise reset
                    indicatorFlag <<= 1;
                    indicatorFlag |= 1; // left-shift bitmask and add another 1 (e.g. 0001 > 0011 > 0111)
                    nextThreshold <<= 1; //Double the next threshold
                    if (8 + indicatorLength > ubyte_mode) {
                        decodedCounter = 0;
                        indicatorLength = 1;
                        indicatorFlag = 0x001;
                        nextThreshold = 0x0100 /*256*/;
                    }
                }
                parsedIndexes.push(index);
            }
        }
        return parsedIndexes;
    }
    //Decodes the integers into byte-level data using a dictionary look-up
    static decode(inputData, dicIndexMaxBits) {
        dicIndexMaxBits = dicIndexMaxBits || 0x0b;
        let codedData = inputData; //stringToNumArray(inputData); //Convert string to an array of numbers
        const decodedData = [];
        while (codedData.length > 0) {
            const dic = new LZWDictionary_1.default(dicIndexMaxBits), plainData = [codedData[0]];
            let oldCode = codedData[0], buffer = dic.getEntry(oldCode), character = oldCode, newCode;
            let i = 0;
            while (!dic.isFull() && i++ < codedData.length - 1) {
                newCode = codedData[i];
                let p = [];
                if (newCode >= dic.getCurPos()) {
                    p = dic.getEntry(oldCode);
                    if (p === null) {
                        console.error(`No dictionary entry in LZW special case: oldCode=${oldCode}; newCode=${newCode}; i=${i}; buffer=${buffer}`);
                    }
                    p = [...(p !== null && p !== void 0 ? p : []), character]; //create a copy of the array p to not overwrite the dic entry and append character=
                }
                else {
                    // Get entry p for coded index codedData[i]
                    p = dic.getEntry(codedData[i]);
                }
                plainData.push.apply(plainData, p); //Merge entry p onto the plainData output
                character = p[0]; // Get first char of p
                dic.addEntry(buffer.concat(character)); // Add new entry to dictionary as buffer+c
                oldCode = newCode;
                buffer = dic.getEntry(oldCode);
            }
            decodedData.push.apply(decodedData, plainData); //First append plainData to decodedData
            codedData = codedData.slice(i + 1); //Second truncate codedData to keep only undecoded stuff before continuing the loop
        }
        return decodedData;
    }
    //Run-length decodes around special character 0x90
    static RLEDecode(byteArr) {
        const opt = [];
        let lastChr = 0, isFlag = false;
        for (let i = 0; i < byteArr.length; i++) {
            const chr = byteArr[i];
            if (isFlag) {
                if (chr == 0x00) {
                    lastChr = 0x90;
                    opt.push(0x90);
                }
                else {
                    for (let j = 0; j < chr - 1; j++) {
                        opt.push(lastChr);
                    }
                }
                isFlag = false;
            }
            else {
                if (chr == 0x90) {
                    isFlag = true;
                }
                else {
                    opt.push(chr);
                    lastChr = chr;
                }
            }
        }
        return opt;
    }
}
exports.LZW = LZW;
exports.default = LZW;
//# sourceMappingURL=LZW.js.map