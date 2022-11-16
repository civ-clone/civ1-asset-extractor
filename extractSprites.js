"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSprites = void 0;
const PicImage_1 = require("./PicImage");
const extractSprites = (content, extractData, defaults, canvasProvider, logger = (message) => console.log(message)) => {
    const canvas = canvasProvider(320, 200), image = new PicImage_1.default(), result = [];
    image.fromString(content, () => {
        image.draw(canvas.getContext('2d', {
            // @ts-ignore
            willReadFrequently: true,
        }));
        Object.entries(extractData).forEach(([path, definitionParents]) => definitionParents.forEach((definition) => definition.contents.forEach((content) => {
            const object = {
                ...defaults,
                ...definition,
                ...content,
            }, filename = `./assets/${path + object.name}.png`, contentCanvas = canvasProvider(object.width, object.height), context = contentCanvas.getContext('2d', {
                // @ts-ignore
                willReadFrequently: true,
            });
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
            logger(`Processing ${filename}...`);
            result.push({
                name: filename,
                uri: contentCanvas.toDataURL('image/png'),
            });
        })));
    });
    return result;
};
exports.extractSprites = extractSprites;
exports.default = exports.extractSprites;
//# sourceMappingURL=extractSprites.js.map