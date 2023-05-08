import { Canvas } from 'canvas';
export type DefinitionData = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};
export type DefinitionChild = DefinitionData & {
  name: string;
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
export declare const extractSprites: (
  content: string,
  extractData: Definition,
  defaults: DefaultData,
  canvasProvider: (width: number, height: number) => Canvas | HTMLCanvasElement,
  logger?: (message: string) => void
) => ImageMap[];
export default extractSprites;
