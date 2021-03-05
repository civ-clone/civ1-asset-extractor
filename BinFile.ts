import * as fs from 'fs';

export class BinFile {
  private blob: string | null = null;
  private ptr: number = -1;

  open(file: string, callback: (...args: any[]) => any) {
    if (!file) {
      console.warn("Couldn't find the file!");
      return;
    }

    fs.readFile(
      file,
      {
        encoding: 'binary',
      },
      (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            console.error('Please copy TER257.PIC to the current directory.');

            return;
          }

          console.error(error);

          return;
        }

        this.blob = content;
        this.ptr = 0;
        this.decode(callback);
      }
    );
  }

  getUByte() {
    return (this.blob as string).charCodeAt(this.ptr++);
  }

  getUShort() {
    const b1 = this.getUByte();
    const b2 = this.getUByte();

    return (b2 << 8) + b1;
  }

  getShort() {
    return ((this.getUShort() + 0x8000) % 0x10000) - 0x8000;
  }

  getString(length: number) {
    const start = this.ptr;
    this.ptr += length;

    return (this.blob as string).substr(start, length);
  }

  decode(callback: (...args: any[]) => any): void {
    if (this.blob === null) {
      console.warn('file has not been loaded!');

      return;
    }

    console.warn('The decode function should be overwritten');
    if (callback) callback();
  }
}

export default BinFile;
