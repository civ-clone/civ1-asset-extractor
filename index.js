"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extractSprites_1 = require("./extractSprites");
const canvas_1 = require("canvas");
const fs = require("fs");
const extractData = JSON.parse((0, fs_1.readFileSync)('./extract-data.json').toString());
['TER257.PIC', 'SP257.PIC'].forEach((file) => {
    const content = fs.readFileSync(file, {
        encoding: 'binary',
    });
    (0, extractSprites_1.extractSprites)(content, extractData.files[file], extractData.defaults, (width, height) => new canvas_1.Canvas(width, height)).forEach(({ name, uri }) => {
        const dirname = name.replace(/\/[^\/]+$/, '/');
        try {
            (0, fs_1.accessSync)('./assets/');
        }
        catch (e) {
            (0, fs_1.mkdirSync)('./assets/');
        }
        try {
            (0, fs_1.accessSync)(dirname);
        }
        catch (e) {
            (0, fs_1.mkdirSync)(dirname);
        }
        const buffer = Buffer.from(uri.replace(/^data:image\/png;base64,/, ''), 'base64');
        console.log(`Writing ${name}...`);
        (0, fs_1.writeFileSync)(name, buffer);
    });
});
//# sourceMappingURL=index.js.map