# civ1-asset-extractor

This repo will extract the base game graphics from the original Civilization game data files and build a set of `.png`
files that can be dropped into the `electron-renderer` package to enable the game to be visible similarly to the
original Civilization game.

This is based entirely off work carried out by others in the CivFanatics forums and is a port of the work found at:

 - http://cived.tigermonkey.org/

## Usage

Copy the required files to this folder from the original Civilization game files:

 - TER257.PIC
 - SP257.PIC

Run:

 - `node index.js`

This will create an `assets/` directory which will have the structure needed to work with the renderer.
