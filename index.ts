import { accessSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Canvas } from 'canvas';
import PicImage from './PicImage';

declare type DefinitionData = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};

declare type DefinitionChild = DefinitionData & { name: string };

declare type DefinitionParent = DefinitionData & {
  contents: DefinitionChild[];
};

declare type Definition = {
  [key: string]: DefinitionParent[];
};

declare type ExtractData = {
  defaults: {
    height: number;
    width: number;
    clear: {
      r: number;
      g: number;
      b: number;
    };
  };
  files: {
    [key: string]: Definition;
  };
};

const extractData: ExtractData = JSON.parse(
  readFileSync('./extract-data.json').toString()
);

['TER257.PIC', 'SP257.PIC'].forEach((file: string) => {
  const canvas = new Canvas(320, 200),
    image = new PicImage();

  image.open(`./${file}`, (data) => {
    image.draw(canvas.getContext('2d') as CanvasRenderingContext2D);

    Object.entries(extractData.files[file]).forEach(
      ([path, definitions]: [string, DefinitionParent[]]) => {
        definitions.forEach((definition) => {
          definition.contents.forEach((content) => {
            const object: { [key: string]: any } = {
                ...extractData.defaults,
                ...definition,
                ...content,
              },
              filename = `./assets/${path + object.name}.png`,
              dirname = filename.replace(/\/[^\/]+$/, '/'),
              contentCanvas = new Canvas(object.width, object.height),
              context = contentCanvas.getContext(
                '2d'
              ) as CanvasRenderingContext2D;

            context.clearRect(0, 0, object.width, object.height);
            context.drawImage(
              (canvas as unknown) as HTMLCanvasElement,
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

            try {
              accessSync('./assets/');
            } catch (e) {
              mkdirSync('./assets/');
            }

            try {
              accessSync(dirname);
            } catch (e) {
              mkdirSync(dirname);
            }

            const buffer = Buffer.from(
              contentCanvas
                .toDataURL('image/png')
                .replace(/^data:image\/png;base64,/, ''),
              'base64'
            );

            console.log(`Writing ${filename}...`);
            writeFileSync(filename, buffer);
          });
        });
      }
    );
  });
});
