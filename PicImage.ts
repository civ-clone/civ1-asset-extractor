import BinFile from './BinFile';
import LZW from './LZW';
import lowerNibble from './lib/lowerNibble';
import upperNibble from './lib/upperNibble';

declare type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export class PicImage extends BinFile {
  private palette: RGBA[] = [];
  private palette16: RGBA[] = [
    { r: 0xff, g: 0xff, b: 0xff, a: 0x00 }, // 0 - transparent
    { r: 0xaa, g: 0x00, b: 0x00, a: 0xff }, // 1
    { r: 0x00, g: 0xaa, b: 0x00, a: 0xff }, // 2
    { r: 0xaa, g: 0xaa, b: 0x00, a: 0xff }, // 3
    { r: 0x00, g: 0x00, b: 0xaa, a: 0xff }, // 4
    { r: 0x00, g: 0x00, b: 0x00, a: 0xff }, // 5
    { r: 0x00, g: 0x55, b: 0xaa, a: 0xff }, // 6
    { r: 0xaa, g: 0xaa, b: 0xaa, a: 0xff }, // 7
    { r: 0x55, g: 0x55, b: 0x55, a: 0xff }, // 8
    { r: 0xff, g: 0x55, b: 0x55, a: 0xff }, // 9
    { r: 0x55, g: 0xff, b: 0x55, a: 0xff }, // A
    { r: 0xff, g: 0xff, b: 0x55, a: 0xff }, // B
    { r: 0x55, g: 0x55, b: 0xff, a: 0xff }, // C
    { r: 0xff, g: 0x55, b: 0xff, a: 0xff }, // D
    { r: 0x55, g: 0xff, b: 0xff, a: 0xff }, // E
    { r: 0xff, g: 0xff, b: 0xff, a: 0xff }, // F
  ];

  private imageData: null | number[] = null;
  private imageHeight = 0;
  private imageWidth = 0;
  private byteMode = 0xb;

  decode(callback: (...args: any[]) => any): void {
    let id = this.getString(2),
      length = this.getShort();

    if (id == 'M0') {
      //Second part could be the VGA Palette information
      this.getPaletteData();
      id = this.getString(2);
      length = this.getShort();
    } else {
      //If no palette information, let's create a random one
      console.log('Creating a random color palette...');
      for (let i = 0; i < 256; i++) {
        if (i < 16) {
          this.palette.push(this.palette16[i]);
        } else {
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
    } else if (id == 'X1') {
      //Final part is image data, in this case EGA
      this.getX1ImageData(length);
    } else {
      //Data chunk is of an unknown type
      console.error('"' + id + '" is an unknown chunk type');
    }

    if (callback) callback();
  }

  getPaletteData() {
    const firstIndex = this.getUByte(),
      lastIndex = this.getUByte(),
      paletteLength = lastIndex - firstIndex + 1;

    let seenBlack = false;

    for (let i = 0; i < paletteLength; i++) {
      const colour: RGBA = {
        r: this.getUByte() * 4, // Each color is between 0 and 64, so to make it use entire
        g: this.getUByte() * 4, // color space, multiply by 4. The higher-order bits may be used
        b: this.getUByte() * 4, // for transparency flags, but that's unclear for now...
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

  getX0ImageData(length: number) {
    this.imageWidth = this.getShort();
    this.imageHeight = this.getShort();
    this.byteMode = this.getUByte();

    //Step #1: parse the remainder of the chunk into a set of integers with flags
    const decompSourceData = LZW.parseByteStreamToIndexes(
        this,
        length - 5,
        this.byteMode
      ),
      //Step #2: decode the data using the LZW algorithm
      decompData = LZW.decode(decompSourceData, this.byteMode);

    //Step #3: decode the final image data using Run-length decoding
    this.imageData = LZW.RLEDecode(decompData);
  }

  getX1ImageData(length: number) {
    this.getX0ImageData(length); //This works the same as x0 data, but each byte includes an upper and lower nibble entry with max 16

    //Loop through each entry and separate into upper and lower nibbles
    const oldImageData = this.imageData as number[];

    this.imageData = [];

    for (let i = 0; i < oldImageData.length; i++) {
      this.imageData.push(lowerNibble(oldImageData[i]));
      this.imageData.push(upperNibble(oldImageData[i]));
    }

    //set the palette to the hard-coded 16-color palette
    this.palette = this.palette16;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    destinationX: number = 0,
    destinationY: number = 0
  ) {
    const canvasData = ctx.getImageData(
      0,
      0,
      this.imageWidth,
      this.imageHeight
    );

    let index = 0;

    for (let y = 0; y < this.imageHeight; y++) {
      for (let x = 0; x < this.imageWidth; x++) {
        const colorIndex = (this.imageData as number[])[index],
          canvasIndex = (x + y * this.imageWidth) * 4;

        canvasData.data[canvasIndex] = this.palette[colorIndex].r;
        canvasData.data[canvasIndex + 1] = this.palette[colorIndex].g;
        canvasData.data[canvasIndex + 2] = this.palette[colorIndex].b;
        canvasData.data[canvasIndex + 3] = this.palette[colorIndex].a;
        index++;
      }
    }

    ctx.putImageData(canvasData, destinationX, destinationY);
  }
}

export default PicImage;
