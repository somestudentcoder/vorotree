# VoroTree #

Live Demo: [GitHub Pages](https://somestudentcoder.github.io/vorotree/)

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

  ```bash
  $> git clone <url> <new folder>
  $> cd <new folder>
  $> npm install
  ```

## Build ##

Commands should be run under a **bash** shell.

The following command builds and runs the project in development mode with Hot Reload.

  ```bash
  $> npx gulp serve
  ```

The following command builds the project in production mode.

  ```bash
  $> npx gulp build
  ```

The following command runs the project as an Electron application.

  ```bash
  $> npx gulp electron
  ```

The following command compiles a standalone Electron application for the operating system it was called on.
You can find the output under /standalone in the project directory.

  ```bash
  $> npx gulp buildElectronApp
  ```

The following command compiles a standalone Electron application for Microsoft Windows x64.
You can find the output under /standalone in the project directory.

  ```bash
  $> npx gulp buildElectronWinApp
  ```

The following command compiles a standalone Electron application for MacOS.
You can find the output under /standalone in the project directory.

  ```bash
  $> npx gulp buildElectronMacApp
  ```

The following command compiles a standalone Electron application for Linux operating systems.
You can find the output under /standalone in the project directory.

  ```bash
  $> npx gulp buildElectronLinuxApp
  ```

The following command compiles standalone Electron applications for all available platforms.
You can find the output under /standalone in the project directory.

  ```bash
  $> npx gulp buildElectronAllApps
  ```

The following command cleans the "dist" folder which includes the bundled source code.

  ```bash
  $> npx gulp clean
  ```

The following command cleans the "dist" folder which includes the bundled source code,
as well as the "node_modules" folder.

  ```bash
  $> npx gulp cleanAll
  ```

The following command contstructs a .json dataset from a specified folder. This folder
can then be viewed and navigated within VoroTree. Specify input folder and output name
in the "folderdatasetconfig.js" file.

  ```bash
  $> npx gulp constructFolderDataset
  ```

## Deploying VoroTree to Github Pages ##

Github Pages offers two ways of hosting your project. Either through an index.html within the root of your
repository or with an index.html within a "docs" folder in your repository. In this repository the way of
using a "docs" folder was chosen to avoid unnecessary or unwanted inclusion of updates to the hosted version
of VoroTree. To deploy a new version of VoroTree to the repository follow these steps:

1. Run the deploy gulp command to build the project and place all necessary files in the apporpriate folder:

  ```bash
  $> npx gulp deploy
  ```

2. Add and push all changes in the /docs folder to the git repository. Once these changes enter the "main/master" branch, Github Pages
will automatically update the sourcecode of the hosted page.

## Included Data ##

Three datasets are included in the VoroTree application for demonstration purposes.

1. Highly edited version of [Country, Regional and World GDP (Gross Domestic Product)](https://datahub.io/core/gdp) dataset. 
Only some countries were selected to produce a smaller dataset for demonstration purposes.

2. Custom car manufacturer dataset constructed by the author. It spans over a selection of car manufacturers divided by
country of origin and select models of the brand.

3. Adapted [Primate dataset](https://github.com/glouwa/d3-hypertree-examples/blob/master/demo/primates.d3.json) which is originally taken from the [Tree of Life project](http://tolweb.org/tree/). Represents the tree of species of Primates.

4. [Drug dataset](https://www.genome.jp/kegg-bin/get_htext?htext=br08302.keg). A drug classification from the USA, that categorizes drugs according to substances and uses.  

5. [Wikipedia editors over the world](https://dumps.wikimedia.org/other/geoeditors/). The nationalities of Wikipedia page editors. Editors are grouped by naionality per Wikipedia page language. Larger entries represent 100 or more editors, while smaller ones represent betwen 5 and 99 editors.

6. [Google product taxonomy](https://www.google.com/basepages/producttype/taxonomy.en-US.txt) - the list of categories used
by Google to help departmentalize products in a shopping feed.

## Data Model ##

The tool supports JSON and CSV files which need to have the following format in order to visualize the data properly.

* **Name** is used as the label of the polygon.
* **Weight** influences the size of the polygon. Only the leaves should have this property. If the weight is not given, the size of the polygon depends on the amount of children.

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

```csv
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

```csv
id,name,parentId,weight
1,Father,,
2,Alice,1,
3,Alice,1,
4,Bob,2,10
5,Doris,3,20
```

## Licence ##

MIT
