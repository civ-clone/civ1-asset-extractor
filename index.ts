import { accessSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { ExtractData, extractSprites } from './extractSprites';
import { Canvas } from 'canvas';
import * as fs from 'fs';

const extractData: ExtractData = JSON.parse(
  readFileSync('./extract-data.json').toString()
);

['TER257.PIC', 'SP257.PIC'].forEach((file: string) => {
  const content = fs.readFileSync(file, {
    encoding: 'binary',
  });

  extractSprites(
    content,
    extractData.files[file],
    extractData.defaults,
    (width, height) => new Canvas(width, height)
  ).forEach(({ name, uri }) => {
    const dirname = name.replace(/\/[^\/]+$/, '/');

    try {
      accessSync('./assets/');
    } catch (e) {
      mkdirSync('./assets/');
    }

    try {
      accessSync(dirname);
    } catch (e) {
      mkdirSync(dirname);
    }

    const buffer = Buffer.from(
      uri.replace(/^data:image\/png;base64,/, ''),
      'base64'
    );

    console.log(`Writing ${name}...`);
    writeFileSync(name, buffer);
  });
});
