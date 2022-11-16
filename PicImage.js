"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PicImage = void 0;
const BinFile_1 = require("./BinFile");
const LZW_1 = require("./LZW");
const lowerNibble_1 = require("./lib/lowerNibble");
const upperNibble_1 = require("./lib/upperNibble");
class PicImage extends BinFile_1.default {
    constructor() {
        super(...arguments);
        this.palette = [];
        this.palette16 = [
            { r: 0xff, g: 0xff, b: 0xff, a: 0x00 },
            { r: 0xaa, g: 0x00, b: 0x00, a: 0xff },
            { r: 0x00, g: 0xaa, b: 0x00, a: 0xff },
            { r: 0xaa, g: 0xaa, b: 0x00, a: 0xff },
            { r: 0x00, g: 0x00, b: 0xaa, a: 0xff },
            { r: 0x00, g: 0x00, b: 0x00, a: 0xff },
            { r: 0x00, g: 0x55, b: 0xaa, a: 0xff },
            { r: 0xaa, g: 0xaa, b: 0xaa, a: 0xff },
            { r: 0x55, g: 0x55, b: 0x55, a: 0xff },
            { r: 0xff, g: 0x55, b: 0x55, a: 0xff },
            { r: 0x55, g: 0xff, b: 0x55, a: 0xff },
            { r: 0xff, g: 0xff, b: 0x55, a: 0xff },
            { r: 0x55, g: 0x55, b: 0xff, a: 0xff },
            { r: 0xff, g: 0x55, b: 0xff, a: 0xff },
            { r: 0x55, g: 0xff, b: 0xff, a: 0xff },
            { r: 0xff, g: 0xff, b: 0xff, a: 0xff }, // F
        ];
        this.imageData = null;
        this.imageHeight = 0;
        this.imageWidth = 0;
        this.byteMode = 0xb;
    }
    decode(callback) {
        let id = this.getString(2), length = this.getShort();
        if (id == 'M0') {
            //Second part could be the VGA Palette information
            this.getPaletteData();
            id = this.getString(2);
            length = this.getShort();
        }
        else {
            //If no palette information, let's create a random one
            console.log('Creating a random color palette...');
            for (let i = 0; i < 256; i++) {
                if (i < 16) {
                    this.palette.push(this.palette16[i]);
                }
                else {
                    this.palette.push({
                        r: Math.floor(Math.random() * 256),
                        g: Math.floor(Math.random() * 256),
                        b: Math.floor(Math.random() * 256),
                        a: 0xff,
                    });
                }
            }
        }
        if (id == 'X0') {
            //Final part is image data, in this case VGA
            this.getX0ImageData(length);
        }
        else if (id == 'X1') {
            //Final part is image data, in this case EGA
            this.getX1ImageData(length);
        }
        else {
            //Data chunk is of an unknown type
            console.error('"' + id + '" is an unknown chunk type');
        }
        if (callback)
            callback();
    }
    getPaletteData() {
        const firstIndex = this.getUByte(), lastIndex = this.getUByte(), paletteLength = lastIndex - firstIndex + 1;
        let seenBlack = false;
        for (let i = 0; i < paletteLength; i++) {
            const colour = {
                r: this.getUByte() * 4,
                g: this.getUByte() * 4,
                b: this.getUByte() * 4,
                a: 0xff,
            };
            this.palette.push(colour);
            if (colour.r === colour.g && colour.g === colour.b && colour.r === 0) {
                // The first black is "real" black, the others are (or at least can be) transparency
                if (!seenBlack) {
                    colour.a = 0;
                }
                seenBlack = true;
            }
        }
        this.palette.push({
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        });
    }
    getX0ImageData(length) {
        this.imageWidth = this.getShort();
        this.imageHeight = this.getShort();
        this.byteMode = this.getUByte();
        //Step #1: parse the remainder of the chunk into a set of integers with flags
        const decompSourceData = LZW_1.default.parseByteStreamToIndexes(this, length - 5, this.byteMode), 
        //Step #2: decode the data using the LZW algorithm
        decompData = LZW_1.default.decode(decompSourceData, this.byteMode);
        //Step #3: decode the final image data using Run-length decoding
        this.imageData = LZW_1.default.RLEDecode(decompData);
    }
    getX1ImageData(length) {
        this.getX0ImageData(length); //This works the same as x0 data, but each byte includes an upper and lower nibble entry with max 16
        //Loop through each entry and separate into upper and lower nibbles
        const oldImageData = this.imageData;
        this.imageData = [];
        for (let i = 0; i < oldImageData.length; i++) {
            this.imageData.push((0, lowerNibble_1.default)(oldImageData[i]));
            this.imageData.push((0, upperNibble_1.default)(oldImageData[i]));
        }
        //set the palette to the hard-coded 16-color palette
        this.palette = this.palette16;
    }
    draw(ctx, destinationX = 0, destinationY = 0) {
        const canvasData = ctx.getImageData(0, 0, this.imageWidth, this.imageHeight);
        let index = 0;
        for (let y = 0; y < this.imageHeight; y++) {
            for (let x = 0; x < this.imageWidth; x++) {
                const colorIndex = this.imageData[index], canvasIndex = (x + y * this.imageWidth) * 4;
                canvasData.data[canvasIndex] = this.palette[colorIndex].r;
                canvasData.data[canvasIndex + 1] = this.palette[colorIndex].g;
                canvasData.data[canvasIndex + 2] = this.palette[colorIndex].b;
                canvasData.data[canvasIndex + 3] = this.palette[colorIndex].a;
                index++;
            }
        }
        ctx.putImageData(canvasData, destinationX, destinationY);
    }
    getPixel(x, y) {
        if (!this.imageData) {
            return 0;
        }
        return this.imageData[x + this.imageWidth * y];
    }
}
exports.PicImage = PicImage;
exports.default = PicImage;
//# sourceMappingURL=PicImage.js.map