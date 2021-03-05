"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const canvas_1 = require("canvas");
const PicImage_1 = require("./PicImage");
const extractData = JSON.parse(fs_1.readFileSync('./extract-data.json').toString());
['TER257.PIC', 'SP257.PIC'].forEach((file) => {
    const canvas = new canvas_1.Canvas(320, 200), image = new PicImage_1.default();
    image.open(`./${file}`, (data) => {
        image.draw(canvas.getContext('2d'));
        Object.entries(extractData.files[file]).forEach(([path, definitions]) => {
            definitions.forEach((definition) => {
                definition.contents.forEach((content) => {
                    const object = {
                        ...extractData.defaults,
                        ...definition,
                        ...content,
                    }, filename = `./assets/${path + object.name}.png`, dirname = filename.replace(/\/[^\/]+$/, '/'), contentCanvas = new canvas_1.Canvas(object.width, object.height), context = contentCanvas.getContext('2d');
                    context.clearRect(0, 0, object.width, object.height);
                    context.drawImage(canvas, object.x, object.y, object.width, object.height, 0, 0, object.width, object.height);
                    for (let x = 0; x < canvas.width; x++) {
                        for (let y = 0; y < canvas.height; y++) {
                            let imageData = context.getImageData(x, y, 1, 1).data;
                            if (imageData[0] == object.clear.r &&
                                imageData[1] == object.clear.g &&
                                imageData[2] == object.clear.b) {
                                context.clearRect(x, y, 1, 1);
                            }
                        }
                    }
                    try {
                        fs_1.accessSync('./assets/');
                    }
                    catch (e) {
                        fs_1.mkdirSync('./assets/');
                    }
                    try {
                        fs_1.accessSync(dirname);
                    }
                    catch (e) {
                        fs_1.mkdirSync(dirname);
                    }
                    const buffer = Buffer.from(contentCanvas
                        .toDataURL('image/png')
                        .replace(/^data:image\/png;base64,/, ''), 'base64');
                    console.log(`Writing ${filename}...`);
                    fs_1.writeFileSync(filename, buffer);
                });
            });
        });
    });
});
//# sourceMappingURL=index.js.map