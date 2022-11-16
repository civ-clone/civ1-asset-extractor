"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = void 0;
const PicImage_1 = require("./PicImage");
class Map extends PicImage_1.default {
    constructor({ mapSeed } = {}) {
        super();
        this.mapWidth = 80;
        this.mapHeight = 50;
        this.layerStarts = [
            // Position of map layers in the map image
            { x: 0, y: 0 },
            { x: 80, y: 0 },
            { x: 0, y: 50 },
            { x: 80, y: 50 },
            { x: 0, y: 100 },
            { x: 80, y: 100 },
            { x: 0, y: 150 },
            { x: 80, y: 150 },
            { x: 160, y: 0 },
            { x: 240, y: 0 }, // 9: Mini-map render
        ];
        this.terrainTable = {
            // Translates between type (stored in map) and sprite ID in the sprite sheet
            0: 320,
            1: 200,
            2: 60,
            3: 160,
            4: 460,
            5: 460,
            6: 20,
            7: 120,
            8: 460,
            9: 320,
            10: 40,
            11: 180,
            12: 80,
            13: 100,
            14: 0,
            15: 140, // Arctic
        };
        this.terrainToString = {
            // Translates between type (stored in map) and sprite ID in the sprite sheet
            0: 'X',
            1: 'O',
            2: 'F',
            3: 'S',
            4: 'X',
            5: 'X',
            6: 'P',
            7: 'T',
            8: 'X',
            9: 'R',
            10: 'G',
            11: 'J',
            12: 'H',
            13: 'M',
            14: 'D',
            15: 'A', // Arctic
        };
        this.improvementsTable = {
            // Translates bits of layer 4 bytes into SpriteSheet location
            0: 393,
            1: 284,
            2: 285,
            3: 300, // Rail / Road
        };
        this.specialsList = {
            1: 390,
            2: 383,
            3: 389,
            4: 400,
            5: 400,
            6: 381,
            7: 386,
            8: 400,
            9: 388,
            10: 391,
            11: 389,
            12: 384,
            13: 385,
            14: 380,
            15: 387, // Arctic - Seal
        };
        this.specialsToString = {
            1: 'f',
            2: 'a',
            3: 'o',
            4: 'x',
            5: 'x',
            6: 'h',
            7: 'a',
            8: 'x',
            9: 'd',
            10: 'd',
            11: 'e',
            12: 'c',
            13: 'g',
            14: 'i',
            15: 's', // Arctic - Seal
        };
        this.defaults = {
            mapSeed: 0x1904,
        };
        this.mapSeed = mapSeed !== null && mapSeed !== void 0 ? mapSeed : this.defaults.mapSeed;
    }
    getMapVal(x, y, layer) {
        return this.getPixel(this.layerStarts[layer].x + x, this.layerStarts[layer].y + y);
    }
    getTileList() {
        const tileList = [];
        for (let y = 0; y < this.mapHeight; y++) {
            tileList[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const baseIndex = this.getMapVal(x, y, 0);
                const xpp = x < 79 ? x + 1 : 0, xmm = x > 0 ? x - 1 : 79, ypp = y < 49 ? y + 1 : 0, ymm = y > 0 ? y - 1 : 49, 
                // Checks to see if in each direction (NSEW) there is a similar type. If river (9) then water (1) is considered similar
                N = this.getMapVal(x, ymm, 0) === baseIndex ? 1 : 0, S = this.getMapVal(x, ypp, 0) === baseIndex ? 1 : 0, E = this.getMapVal(xpp, y, 0) === baseIndex ? 1 : 0, W = this.getMapVal(xmm, y, 0) === baseIndex ? 1 : 0;
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
        const tileList = [];
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
                        const xpp = x < 79 ? x + 1 : 0, xmm = x > 0 ? x - 1 : 79, ypp = y < 49 ? y + 1 : 0, ymm = y > 0 ? y - 1 : 49;
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
                }
                else {
                    tileList[y].push([]);
                }
                baseIndex = this.getMapVal(x, y, 0);
                // Random City Improvements
                const addShield = (y + x) % 4 === 0 || (y + x) % 4 === 3, addSpecial = (x & 0x3) * 4 + (y & 0x3) ===
                    (((x >> 2) * 0xd + (y >> 2) * 0xb + this.mapSeed) & 0xf), hut = (((x >> 2) * 0xd + (y >> 2) * 0xb + this.mapSeed + 8) & 0x1f) ===
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
        const tileList = [];
        for (let y = 0; y < this.mapHeight; y++) {
            tileList[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const baseIndex = this.getMapVal(x, y, 0), xpp = x < 79 ? x + 1 : 0, xmm = x > 0 ? x - 1 : 79, ypp = y < 49 ? y + 1 : 0, ymm = y > 0 ? y - 1 : 49;
                // Checks to see if in each direction (NSEW) there is a similar type. If river (9) then water (1) is considered similar
                if (baseIndex === 9) {
                    const N = this.getMapVal(x, ymm, 0) === 9 || this.getMapVal(x, ymm, 0) === 1
                        ? 1
                        : 0, S = this.getMapVal(x, ypp, 0) === 9 || this.getMapVal(x, ypp, 0) === 1
                        ? 1
                        : 0, W = this.getMapVal(xmm, y, 0) === 9 || this.getMapVal(xmm, y, 0) === 1
                        ? 1
                        : 0, E = this.getMapVal(xpp, y, 0) === 9 || this.getMapVal(xpp, y, 0) === 1
                        ? 1
                        : 0, offset = N | (E << 1) | (S << 2) | (W << 3); // combine each T/F as a bit to form a number from 0-15
                    tileList[y].push([this.terrainTable[baseIndex] + offset]);
                }
                else if (baseIndex === 1) {
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
                }
                else {
                    tileList[y].push([-1]);
                }
            }
        }
        return tileList;
    }
    getTerrainMap() {
        let stringMap = '';
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const baseIndex = this.getMapVal(x, y, 0);
                stringMap += this.terrainToString[baseIndex];
                const addShield = (y + x) % 4 === 0 || (y + x) % 4 === 3, addSpecial = (x & 0x3) * 4 + (y & 0x3) ===
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
exports.Map = Map;
exports.default = Map;
//# sourceMappingURL=Map.js.map