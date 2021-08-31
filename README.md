# VoroTree #


Main dependencies:

* **Application Server**: [Node](https://nodejs.org/en/)
* **Compiler**: [TypeScript](https://github.com/Microsoft/TypeScript)
* **Bundler**: [Webpack](https://github.com/webpack/webpack)
* **Task Runner**: [Gulp](https://gulpjs.com/)
* **Pixi.js**: [Pixi.js](http://www.pixijs.com/)
* **pixi-viewport**: [pixi-viewport](https://github.com/davidfig/pixi-viewport)
* **D3.js**: [D3.js](https://d3js.org/)
* **Electron**: [Electron](https://www.electronjs.org/)


## Installation ##

Node and TypeScript should be installed globally.

	$> git clone <url> <new folder>
	$> cd <new folder>
	$> npm install


## Build ##

Commands should be run under a **bash** shell.

The following command builds and runs the project in development mode with Hot Reload.

	$> npx gulp serve

The following command builds the project in production mode.

	$> npx gulp build

The following command runs the project as an Electron application.

	$> npx gulp electron

The following command compiles a standalone Electron application for the operating system it was called on.
You can find the output under /standalone in the project directory.

	$> npx gulp buildElectronApp

The following command compiles a standalone Electron application for Microsoft Windows x64.
You can find the output under /standalone in the project directory.

	$> npx gulp buildElectronWinApp

The following command compiles a standalone Electron application for MacOS.
You can find the output under /standalone in the project directory.

	$> npx gulp buildElectronMacApp

The following command compiles a standalone Electron application for Linux operating systems.
You can find the output under /standalone in the project directory.

	$> npx gulp buildElectronLinuxApp

The following command compiles standalone Electron applications for all available platforms.
You can find the output under /standalone in the project directory.

	$> npx gulp buildElectronAllApps

The following command cleans the "dist" folder which includes the bundled source code.

	$> npx gulp clean

The following command cleans the "dist" folder which includes the bundled source code,
as well as the "node_modules" folder.

	$> npx gulp cleanAll


## Data Model ##

The tool supports JSON and CSV files which need to have the following format in order to visualize the data properly.

- **Name** is used as the label of the polygon.
- **Weight** influences the size of the polygon. Only the leaves should have this property. If the weight is not given, the size of the polygon depends on the amount of children.

### JSON Example ###


```json 

{
      "name": "America",
      "children": [
        {
          "name": "North America",
          "children": [
            {"name": "United States", "weight": 24.32},
            {"name": "Canada", "weight": 2.09},
            {"name": "Mexico", "weight": 1.54}
          ]
        },
        {
          "name": "South America",
          "children": [
            {"name": "Brazil", "weight": 2.39},
            {"name": "Argentina", "weight": 0.79},
            {"name": "Venezuela", "weight": 0.5},
            {"name": "Colombia", "weight": 0.39}
          ]
        }
      ]
}


```

### CSV Examples ###

To create a Voronoi Treemap from a CSV file, the columns **name** and **parent** are required. The **weight** is optional as described above. 

```
 name,parent,weight
 cars,,
 owned,cars,
 traded,cars,
 learned,cars,
 pilot,owned,40
 325ci,owned,40
 accord,owned,20
 chevette,traded,10
 odyssey,learned,20
 maxima,learned,10
```

However if parents are not unique, the tool requires **id**, **name** and **parentId** to create a hierarchy from this data set.

```
id,name,parentId,weight
1,Father,,
2,Alice,1,
3,Alice,1,
4,Bob,2,10
5,Doris,3,20
```

## Licence ##

MIT
