import { Canvas } from 'canvas';
import PicImage from './PicImage';

export type DefinitionData = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};

export type DefinitionChild = DefinitionData & { name: string };

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

          // Knock out the transparent colour in a single readback rather than
          // one `getImageData` per pixel.
          const imageData = context.getImageData(
              0,
              0,
              object.width,
              object.height
            ),
            { data } = imageData;

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
