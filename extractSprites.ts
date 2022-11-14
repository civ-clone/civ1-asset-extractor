import { Canvas, CanvasRenderingContext2D } from 'canvas';
import PicImage from './PicImage';

type DefinitionData = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};

type DefinitionChild = DefinitionData & { name: string };

type DefinitionParent = DefinitionData & {
  contents: DefinitionChild[];
};

type Definition = {
  [filename: string]: DefinitionParent[];
};

type DefaultData = {
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

type ImageMap = {
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
            canvas,
            object.x,
            object.y,
            object.width,
            object.height,
            0,
            0,
            object.width,
            object.height
          );

          for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
              let imageData = context.getImageData(x, y, 1, 1).data;

              if (
                imageData[0] == object.clear.r &&
                imageData[1] == object.clear.g &&
                imageData[2] == object.clear.b
              ) {
                context.clearRect(x, y, 1, 1);
              }
            }
          }

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
