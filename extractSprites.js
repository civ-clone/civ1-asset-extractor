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
            var _a;
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
            // Apply any overlay and knock out the transparent colour in a single
            // readback rather than one `getImageData` per pixel.
            const imageData = context.getImageData(0, 0, object.width, object.height), { data } = imageData;
            ((_a = object.overlay) !== null && _a !== void 0 ? _a : []).forEach((row, y) => row
                .trim()
                .split(/\s+/)
                .forEach((pixel, x) => {
                if (pixel === '..' || x >= object.width || y >= object.height) {
                    return;
                }
                const { r, g, b, a } = image.getColour(parseInt(pixel, 16)), offset = (y * object.width + x) * 4;
                data[offset] = r;
                data[offset + 1] = g;
                data[offset + 2] = b;
                data[offset + 3] = a;
            }));
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