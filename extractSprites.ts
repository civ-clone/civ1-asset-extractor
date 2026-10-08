import { Canvas } from 'canvas';
import PicImage from './PicImage';

export type DefinitionData = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};

// Rows of palette indices, written over the sprite once it's cut out, as two hex digits per pixel separated by spaces.
//  `..` keeps the original pixel. Used to make new sprites from the originals while shipping only the changed pixels.
export type Overlay = string[];

export type DefinitionChild = DefinitionData & {
  name: string;
  overlay?: Overlay;
};

export type DefinitionParent = DefinitionData & {
  contents: DefinitionChild[];
};

export type Definition = {
  [filename: string]: DefinitionParent[];
};

export type DefaultData = {
  height: number;
  width: number;
  clear: {
    r: number;
    g: number;
    b: number;
  };
};

export type ExtractData = {
  defaults: DefaultData;
  files: {
    [filename: string]: Definition;
  };
};

export type ImageMap = {
  name: string;
  uri: string;
};

export const extractSprites = (
  content: string,
  extractData: Definition,
  defaults: DefaultData,
  canvasProvider: (width: number, height: number) => Canvas | HTMLCanvasElement,
  logger: (message: string) => void = (message) => console.log(message)
): ImageMap[] => {
  const canvas = canvasProvider(320, 200),
    image = new PicImage(),
    result: ImageMap[] = [];

  image.fromString(content, () => {
    image.draw(
      canvas.getContext('2d', {
        // @ts-ignore
        willReadFrequently: true,
      }) as CanvasRenderingContext2D
    );

    Object.entries(extractData).forEach(([path, definitionParents]) =>
      definitionParents.forEach((definition) =>
        definition.contents.forEach((content) => {
          const object: { [key: string]: any } = {
              ...defaults,
              ...definition,
              ...content,
            },
            filename = `./assets/${path + object.name}.png`,
            contentCanvas = canvasProvider(object.width, object.height),
            context = contentCanvas.getContext('2d', {
              // @ts-ignore
              willReadFrequently: true,
            }) as CanvasRenderingContext2D;

          context.clearRect(0, 0, object.width, object.height);
          context.drawImage(
            canvas as HTMLCanvasElement,
            object.x,
            object.y,
            object.width,
            object.height,
            0,
            0,
            object.width,
            object.height
          );

          // Apply any overlay and knock out the transparent colour in a single
          // readback rather than one `getImageData` per pixel.
          const imageData = context.getImageData(
              0,
              0,
              object.width,
              object.height
            ),
            { data } = imageData;

          ((object.overlay ?? []) as Overlay).forEach((row, y) =>
            row
              .trim()
              .split(/\s+/)
              .forEach((pixel, x) => {
                if (pixel === '..' || x >= object.width || y >= object.height) {
                  return;
                }

                const { r, g, b, a } = image.getColour(parseInt(pixel, 16)),
                  offset = (y * object.width + x) * 4;

                data[offset] = r;
                data[offset + 1] = g;
                data[offset + 2] = b;
                data[offset + 3] = a;
              })
          );

          for (let offset = 0; offset < data.length; offset += 4) {
            if (
              data[offset] == object.clear.r &&
              data[offset + 1] == object.clear.g &&
              data[offset + 2] == object.clear.b
            ) {
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
        })
      )
    );
  });

  return result;
};

export default extractSprites;
