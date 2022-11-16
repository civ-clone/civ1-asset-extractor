# civ1-asset-extractor

This repo is able to extract the base game graphics from the Civilization DOS game data files and build a set of `.png`
files to enable the game to be visually similar to the original game.

This is used internally as a library by the `web-renderer` package via the UI, but can also be used to manually generate
assets that can be dropped into the `electron-renderer` package:

Copy the required files to this folder from the original Civilization game files:

- `TER257.PIC`
- `SP257.PIC`

Run:

- `node index.js`

This will create an `assets/` directory which will have the structure needed to work with the renderer.

This can also extract map data in the format used by
[`simple-world-loader`'s `simpleRLELoader`](https://github.com/civ-clone/simple-world-generator/blob/master/tests/lib/simpleRLELoader.ts)
via:

- `node extractMap.js <filename>` (where `<filename>` is either `MAP.PIC` - the map used for playing on Earth, or a
  saved game file like `CIVIL0.MAP`)

This is based entirely off work carried out by others in the CivFanatics forums and is a port of the work found at:

 - http://cived.tigermonkey.org/
