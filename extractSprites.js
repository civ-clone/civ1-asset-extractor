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
            // Knock out the transparent colour in a single readback rather than
            // one `getImageData` per pixel.
            const imageData = context.getImageData(0, 0, object.width, object.height), { data } = imageData;
            for (let offset = 0; offset < data.length; offset += 4) {
                if (data[offset] == object.clear.r &&
                    data[offset + 1] == object.clear.g &&
                    data[offset + 2] == object.clear.b) {
                    data[offset] = 0;
                    data[offset + 1] = 0;
                    data[offset + 2] = 0;
                    data[offset + 3] = 0;
                }
            }
            context.putImageData(imageData, 0, 0);
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