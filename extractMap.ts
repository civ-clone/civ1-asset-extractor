import { readFileSync } from 'fs';
import Map from './Map';

const filename = process.argv[2];

if (!filename) {
  console.error('Please provide the filename you wish to try and parse');

  process.exit(1);
}

const map = new Map();

map.fromString(
  readFileSync(filename, {
    encoding: 'binary',
  }),
  () => console.log(map.getTerrainMap())
);
