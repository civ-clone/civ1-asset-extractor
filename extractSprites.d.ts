import { Canvas } from 'canvas';
declare type DefinitionData = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};
declare type DefinitionChild = DefinitionData & {
  name: string;
};
declare type DefinitionParent = DefinitionData & {
  contents: DefinitionChild[];
};
declare type Definition = {
  [filename: string]: DefinitionParent[];
};
declare type DefaultData = {
  height: number;
  width: number;
  clear: {
    r: number;
    g: number;
    b: number;
  };
};
export declare type ExtractData = {
  defaults: DefaultData;
  files: {
    [filename: string]: Definition;
  };
};
declare type ImageMap = {
  name: string;
  uri: string;
};
export declare const extractSprites: (
  content: string,
  extractData: Definition,
  defaults: DefaultData,
  canvasProvider: (width: number, height: number) => Canvas | HTMLCanvasElement,
  logger?: (message: string) => void
) => ImageMap[];
export default extractSprites;
