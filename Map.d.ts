import PicImage from './PicImage';
declare type Options = {
  mapSeed: number;
};
export declare class Map extends PicImage {
  private mapWidth;
  private mapHeight;
  private layerStarts;
  private terrainTable;
  private terrainToString;
  private improvementsTable;
  private specialsList;
  private specialsToString;
  private mapSeed;
  private defaults;
  constructor({ mapSeed }?: Partial<Options>);
  getMapVal(x: number, y: number, layer: number): number;
  getTileList(): number[][][];
  getImprovements(): number[][][];
  getRivers(): number[][][];
  getTerrainMap(): string;
}
export default Map;
