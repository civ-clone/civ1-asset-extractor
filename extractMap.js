"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Map_1 = require("./Map");
const filename = process.argv[2];
if (!filename) {
    console.error('Please provide the filename you wish to try and parse');
    process.exit(1);
}
const map = new Map_1.default();
map.fromString((0, fs_1.readFileSync)(filename, {
    encoding: 'binary',
}), () => console.log(map.getTerrainMap()));
//# sourceMappingURL=extractMap.js.map