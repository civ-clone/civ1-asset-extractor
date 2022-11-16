import PicImage from './PicImage';

type Coordinate = {
  x: number;
  y: number;
};

type Lookup<V = number> = { [key: number]: V };

type Options = {
  mapSeed: number;
};

export class Map extends PicImage {
  private mapWidth: number = 80;
  private mapHeight: number = 50;
  private layerStarts: Coordinate[] = [
    // Position of map layers in the map image
    { x: 0, y: 0 }, // 0: Terrain Data
    { x: 80, y: 0 }, // 1: Per-civ Land Occupation
    { x: 0, y: 50 }, // 2: Area segmentation with identifiers for separate land masses and inner seas
    { x: 80, y: 50 }, // 3: Terrain-based land appeal for computer to build cities
    { x: 0, y: 100 }, // 4: Terrain improvements (irrigation, mining, roads) as visible to player
    { x: 80, y: 100 }, // 5: Terrain improvements (irrigation, mining, roads) as they actually are
    { x: 0, y: 150 }, // 6: Railroads, roads, rivers, fortresses as visible to player
    { x: 80, y: 150 }, // 7: Railroads, roads, rivers, fortresses as they actually are
    { x: 160, y: 0 }, // 8: Per-civ land exploration and active units
    { x: 240, y: 0 }, // 9: Mini-map render
  ];

  private terrainTable: Lookup = {
    // Translates between type (stored in map) and sprite ID in the sprite sheet
    0: 320, // Land
    1: 200, // Ocean
    2: 60, // Forest
    3: 160, // Swamp
    4: 460, // UNKNOWN SHOWS UP AS SETTLERS
    5: 460, // UNKNOWN SHOWS UP AS SETTLERS
    6: 20, // Plains
    7: 120, // Tundra
    8: 460, // UNKNOWN SHOWS UP AS SETTLERS
    9: 320, // River
    10: 40, // Grassland
    11: 180, // Jungle
    12: 80, // Hills
    13: 100, // Mountains
    14: 0, // Desert
    15: 140, // Arctic
  };

  private terrainToString: Lookup<string> = {
    // Translates between type (stored in map) and sprite ID in the sprite sheet
    0: 'X', // Land
    1: 'O', // Ocean
    2: 'F', // Forest
    3: 'S', // Swamp
    4: 'X', // UNKNOWN SHOWS UP AS SETTLERS
    5: 'X', // UNKNOWN SHOWS UP AS SETTLERS
    6: 'P', // Plains
    7: 'T', // Tundra
    8: 'X', // UNKNOWN SHOWS UP AS SETTLERS
    9: 'R', // River
    10: 'G', // Grassland
    11: 'J', // Jungle
    12: 'H', // Hills
    13: 'M', // Mountains
    14: 'D', // Desert
    15: 'A', // Arctic
  };

  private improvementsTable: Lookup = {
    // Translates bits of layer 4 bytes into SpriteSheet location
    0: 393, // City
    1: 284, // Irrigation
    2: 285, // Mining
    3: 300, // Rail / Road
  };

  private specialsList: Lookup = {
    1: 390, // Water - Fish
    2: 383, // Forest - Deer
    3: 389, // Swamp - Oil
    4: 400, // Unknown
    5: 400, // Unknown
    6: 381, // Plains - Horse
    7: 386, // Tundra - Antelopes
    8: 400, // Unknown
    9: 388, // River - Shield
    10: 391, // Grass lands - Shield
    11: 389, // Jungle - Gems
    12: 384, // Hills - Oil
    13: 385, // Mountains - Gold
    14: 380, // Desert - Oasis
    15: 387, // Arctic - Seal
  };

  private specialsToString: Lookup<string> = {
    1: 'f', // Water - Fish
    2: 'a', // Forest - Deer
    3: 'o', // Swamp - Oil
    4: 'x', // Unknown
    5: 'x', // Unknown
    6: 'h', // Plains - Horse
    7: 'a', // Tundra - Antelopes
    8: 'x', // Unknown
    9: 'd', // River - Shield
    10: 'd', // Grass lands - Shield
    11: 'e', // Jungle - Gems
    12: 'c', // Hills - Oil
    13: 'g', // Mountains - Gold
    14: 'i', // Desert - Oasis
    15: 's', // Arctic - Seal
  };

  private mapSeed: number;

  private defaults: Options = {
    mapSeed: 0x1904,
  };

  constructor({ mapSeed }: Partial<Options> = {}) {
    super();

    this.mapSeed = mapSeed ?? this.defaults.mapSeed;
  }

  getMapVal(x: number, y: number, layer: number) {
    return this.getPixel(
      this.layerStarts[layer].x + x,
      this.layerStarts[layer].y + y
    );
  }

  getTileList() {
    const tileList: number[][][] = [];

    for (let y = 0; y < this.mapHeight; y++) {
      tileList[y] = [];

      for (let x = 0; x < this.mapWidth; x++) {
        const baseIndex = this.getMapVal(x, y, 0);

        const xpp = x < 79 ? x + 1 : 0,
          xmm = x > 0 ? x - 1 : 79,
          ypp = y < 49 ? y + 1 : 0,
          ymm = y > 0 ? y - 1 : 49,
          // Checks to see if in each direction (NSEW) there is a similar type. If river (9) then water (1) is considered similar
          N = this.getMapVal(x, ymm, 0) === baseIndex ? 1 : 0,
          S = this.getMapVal(x, ypp, 0) === baseIndex ? 1 : 0,
          E = this.getMapVal(xpp, y, 0) === baseIndex ? 1 : 0,
          W = this.getMapVal(xmm, y, 0) === baseIndex ? 1 : 0;

        let offset = N | (E << 1) | (S << 2) | (W << 3); // combine each T/F as a bit to form a number from 0-15

        if (baseIndex === 1) {
          offset ^= 0xf;
        }

        if (baseIndex === 9) {
          offset = 0; // override for rivers since we will render them later
        }

        tileList[y].push([this.terrainTable[baseIndex] + offset]);
      }
    }
    return tileList;
  }

  getImprovements() {
    const tileList: number[][][] = [];

    for (let y = 0; y < this.mapHeight; y++) {
      tileList[y] = [];

      for (let x = 0; x < this.mapWidth; x++) {
        // Civ-generated improvements
        let baseIndex = this.getMapVal(x, y, 5);

        if (baseIndex > 1) {
          tileList[y].push([]);
          // Check for roads...
          if (baseIndex & 0x1) {
            tileList[y][x].push(this.improvementsTable[0]); // City
          }

          if (baseIndex & 0x2) {
            tileList[y][x].push(this.improvementsTable[1]); // City
          }

          if (baseIndex & 0x4) {
            tileList[y][x].push(this.improvementsTable[2]); // City
          }

          if (baseIndex & 0x8) {
            const xpp = x < 79 ? x + 1 : 0,
              xmm = x > 0 ? x - 1 : 79,
              ypp = y < 49 ? y + 1 : 0,
              ymm = y > 0 ? y - 1 : 49;

            if (this.getMapVal(x, ymm, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3]); // Northern Road
            }

            if (this.getMapVal(xpp, ymm, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 1); // North Eastern Road
            }

            if (this.getMapVal(xpp, y, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 2); // Eastern Road
            }

            if (this.getMapVal(xpp, ypp, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 3); // South Eastern Road
            }

            if (this.getMapVal(x, ypp, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 4); // Southern Road
            }

            if (this.getMapVal(xmm, ypp, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 5); // South Western Road
            }

            if (this.getMapVal(xmm, y, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 6); // Western Road
            }

            if (this.getMapVal(xmm, ymm, 5) & 0x8) {
              tileList[y][x].push(this.improvementsTable[3] + 7); // North Western Road
            }
          }
        } else {
          tileList[y].push([]);
        }

        baseIndex = this.getMapVal(x, y, 0);

        // Random City Improvements
        const addShield = (y + x) % 4 === 0 || (y + x) % 4 === 3,
          addSpecial =
            (x & 0x3) * 4 + (y & 0x3) ===
            (((x >> 2) * 0xd + (y >> 2) * 0xb + this.mapSeed) & 0xf),
          hut =
            (((x >> 2) * 0xd + (y >> 2) * 0xb + this.mapSeed + 8) & 0x1f) ===
            (x & 0x3) * 4 + (y & 0x3);

        if (baseIndex === 10 && addShield) {
          tileList[y][x].push(382);
        }

        if (addSpecial) {
          tileList[y][x].push(this.specialsList[baseIndex]);
        }

        if (hut && baseIndex != 1 && y > 1 && y < 48) {
          tileList[y][x].push(395);
        }
      }
    }
    return tileList;
  }

  getRivers() {
    const tileList: number[][][] = [];

    for (let y = 0; y < this.mapHeight; y++) {
      tileList[y] = [];

      for (let x = 0; x < this.mapWidth; x++) {
        const baseIndex = this.getMapVal(x, y, 0),
          xpp = x < 79 ? x + 1 : 0,
          xmm = x > 0 ? x - 1 : 79,
          ypp = y < 49 ? y + 1 : 0,
          ymm = y > 0 ? y - 1 : 49;

        // Checks to see if in each direction (NSEW) there is a similar type. If river (9) then water (1) is considered similar
        if (baseIndex === 9) {
          const N =
              this.getMapVal(x, ymm, 0) === 9 || this.getMapVal(x, ymm, 0) === 1
                ? 1
                : 0,
            S =
              this.getMapVal(x, ypp, 0) === 9 || this.getMapVal(x, ypp, 0) === 1
                ? 1
                : 0,
            W =
              this.getMapVal(xmm, y, 0) === 9 || this.getMapVal(xmm, y, 0) === 1
                ? 1
                : 0,
            E =
              this.getMapVal(xpp, y, 0) === 9 || this.getMapVal(xpp, y, 0) === 1
                ? 1
                : 0,
            offset = N | (E << 1) | (S << 2) | (W << 3); // combine each T/F as a bit to form a number from 0-15

          tileList[y].push([this.terrainTable[baseIndex] + offset]);
        } else if (baseIndex === 1) {
          // Check for River mouths
          tileList[y].push([]);

          if (this.getMapVal(x, ymm, 0) === 9) {
            tileList[y][x].push(228);
          } // Northern River mouth

          if (this.getMapVal(x, ypp, 0) === 9) {
            tileList[y][x].push(230);
          } // Southern River mouth

          if (this.getMapVal(xpp, y, 0) === 9) {
            tileList[y][x].push(229);
          } // Eastern River mouth

          if (this.getMapVal(xmm, y, 0) === 9) {
            tileList[y][x].push(231);
          } // Western River mouth
        } else {
          tileList[y].push([-1]);
        }
      }
    }

    return tileList;
  }

  getTerrainMap(): string {
    let stringMap = '';

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const baseIndex = this.getMapVal(x, y, 0);

        stringMap += this.terrainToString[baseIndex];

        const addShield = (y + x) % 4 === 0 || (y + x) % 4 === 3,
          addSpecial =
            (x & 0x3) * 4 + (y & 0x3) ===
            (((x >> 2) * 0xd + (y >> 2) * 0xb + this.mapSeed) & 0xf);

        if (baseIndex === 10 && addShield) {
          stringMap += 'd';
        }

        if (addSpecial) {
          stringMap += this.specialsToString[baseIndex];
        }
      }

      stringMap += '\n';
    }

    return stringMap;
  }
}

export default Map;
