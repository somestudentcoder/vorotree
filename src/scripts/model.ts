import { Polygon } from './polygon';
import { Point } from './point';
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import {csv, json} from "d3-fetch";
import { voronoiTreemap } from "d3-voronoi-treemap";
import {csvParse} from "d3-dsv";
import chroma = require('chroma-js');
import dirTree = require('directory-tree');

var seedrandom = require('seedrandom');
let AQUAMARINE = chroma.scale(['#80ff80', '#80ff9f', '#80ffbf', '#7fffd4', '#80ffdf', '#80ffff', '#80dfff', '#80bfff']);
let RAINBOW = chroma.scale(['red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'purple']);
let GRAYSCALE = chroma.scale(['#e6e6e6', '#cccccc', '#b3b3b3', '#999999', '#808080', '#737373', '#595959']);
let Y_SCALE = chroma.scale(['#000000', '#7d7d7d']);

export class Model{
  public currentPolygonID: number = 0;
  public root_polygon: Polygon = {} as Polygon;
  public current_root_polygon: Polygon = {} as Polygon;
  public lastFileRead: any;
  public fileReloadSelector: number = -1;
  public staticConstruction: boolean = true;
  public seed: number = Math.random();
  public prng = seedrandom(this.seed);


  loadExample(ex: number) {
    this.refresh();
    view.displayLoading(true);

    if (ex == 1) {
      json('data/world_gdp.json')
        .then((jsonData) => {
          let root = hierarchy(jsonData);
          this.createTreemap(root);
          this.fileReloadSelector = 1;
        })
        .then(() => {
          view.displayLoading(false);
        }).catch(() => {
          window.alert("Could not load GDP example.");
        });
    }
    else if (ex == 2) {
      csv('data/cars.csv')
        .then((csvData) => {
          let root = stratify()
            .id(function (d:any = {}) { return d.name; })
            .parentId(function (d:any = {}) { return d.parent; })
            (csvData);
          this.createTreemap(root);
          this.fileReloadSelector = 2;
        })
        .then(() => {
          view.displayLoading(false);
        }).catch(() => {
          window.alert("Could not load Car example.");
        });
    }
    else if (ex == 3) {
      json('data/primates.json')
        .then((jsonData) => {
            let root = hierarchy(jsonData);
            this.assignWeights(root.leaves());
            this.createTreemap(root);
            this.fileReloadSelector = 3;
        })
        .then(() => {
          view.displayLoading(false);
        }).catch(() => {
          window.alert("Could not load Primate example.");
        });
    }
    else if (ex == 4) {
      csv('data/drugs.csv')
        .then((csvData) => {
          let root = stratify()
            .id(function (d:any = {}) { return d.name; })
            .parentId(function (d:any = {}) { return d.parent; })
            (csvData);
          this.assignWeights(root.leaves());
          this.createTreemap(root);
          this.fileReloadSelector = 4;
        })
        .then(() => {
          view.displayLoading(false);
        }).catch(() => {
          window.alert("Could not load drug example.");
        });
    }
    else if (ex == 5) {
      csv('data/geoeditors.csv')
        .then((csvData) => {
          let root = stratify()
            .id(function (d:any = {}) { return d.name; })
            .parentId(function (d:any = {}) { return d.parent; })
            (csvData);
          this.createTreemap(root);
          this.fileReloadSelector = 5;
        })
        .then(() => {
          view.displayLoading(false);
        }).catch(() => {
          window.alert("Could not load Wikipedia example.");
        });
    }
    else if (ex == 6) {
      json('data/google_product_taxonomy.json')
        .then((jsonData) => {
            let root = hierarchy(jsonData);
            this.assignWeights(root.leaves());
            this.createTreemap(root);
            this.fileReloadSelector = 6;
        })
        .then(() => {
          view.displayLoading(false);
        }).catch(() => {
          window.alert("Could not load Google Taxonomy example.");
        });
    }
  }

  createRootPolygon(rootNode: HierarchyNode<any>){
    if(rootNode.children == undefined){
      return;
    }
    // let sum = 0;
    // for(let leaf of rootNode.leaves()){
    //   sum += parseInt(this.getWeight(leaf.data));
    // }
    // for(let leaf of rootNode.leaves()){
    //   leaf.data['weight'] = (leaf.data['weight'] * 100) / sum;
    // }
    let polygon = this.getPolygon(rootNode);
    this.root_polygon = Polygon.from(polygon, polygon.site);
    this.root_polygon.center = new Point(view.width / 2, view.height / 2);
    this.current_root_polygon = this.root_polygon;
    this.treemapToPolygons(this.root_polygon, rootNode, true)
  }

  treemapToPolygons(rootPolygon: Polygon, rootNode: HierarchyNode<unknown>, root: boolean){
    if(rootNode.children == undefined){
      return;
    }
    let i = 0;
    for(let node of rootNode.children){
      let poly = this.getPolygon(node);

      let c1 = AQUAMARINE(poly.site.x / view.width);
      let c2 = Y_SCALE(poly.site.y / view.height);
      let color1 = chroma.mix(c1, c2).num()

      c1 = RAINBOW(poly.site.x / view.width);
      c2 = Y_SCALE(poly.site.y / view.height);
      let color2 = chroma.mix(c1, c2).num()

      c1 = GRAYSCALE(poly.site.x / view.width);
      c2 = Y_SCALE(poly.site.y / view.height);
      let color3 = chroma.mix(c1, c2).num()

      let color = [color1, color2, color3]

      let new_poly = Polygon.from(poly, poly.site, rootPolygon, color, this.getPath(node.data));
      new_poly.polygon_parent = rootPolygon;
      new_poly.name = this.getName(node.data);
      this.checkName(new_poly);

      //new_poly.weight = this.calculateWeight(node);

      rootPolygon.polygon_children.push(new_poly);
      this.treemapToPolygons(new_poly, node, false);
      i++;
    }
  }

  // calculateWeight(root: HierarchyNode<unknown>){
  //   let weight = this.getWeight(root.data);
  //   if(weight == undefined || weight == ""){
  //     if(root.children == undefined){
  //       console.error("node has no weight and no children");
  //       return;
  //     }
  //     weight = 0;
  //     for(let child of root.children){
  //       weight += this.calculateWeight(child);
  //     }
  //   }
  //   return weight;
  // }

  // getWeight(obj: any = {}){
  //   if(obj.hasOwnProperty('poly_weight')){
  //     return obj.poly_weight;
  //   }
  //   else{
  //     return obj.weight;
  //   }

  // }

  getPath(obj: any = {}){
    if(obj.hasOwnProperty('path')){
      return obj.path;
    }
    else{
      return "";
    }
  }

  getName(obj: any = {}){
    return obj.name;
  }

  getPolygon(obj: any = {}){
    return obj.polygon;
  }

  loadRandomPoints(num: number) {
    let pointList = [];
    for(var i = 0; i < num; i++) {
      var x = Math.random() * view.app.renderer.width;
      var y = Math.random() * view.app.renderer.height;
      pointList.push(new Point(x, y));
    }
    return pointList;
  }


  randomIntFromInterval(min: number, max: number) 
  { 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  computeVoronoi(files: any)
  {
    this.refresh();
    this.lastFileRead = files;
    this.fileReloadSelector = 0;

    let reader = new FileReader();

    reader.onload = (event: any) => {

      if(event.target != null) {
        let text = event.target.result;
        if(typeof(text) == "string") {

          let root  = files[0].name.split('.').pop() == 'csv' ?
            this.parseCsv(text) :
            this.parseJson(text);

            if(typeof(root) == "undefined") {
              return;
            }

            this.assignWeights(root.leaves());
            this.createTreemap(root);
        }
      }
    };

    reader.readAsText(files[0]);

    // view.displayLoading(false);
  }

  async createTreemap(root: HierarchyNode<any>) {
    view.displayLoading(true);
    root.sum(function (d: any = {}) {
      return d.weight;
    });

    if(!this.staticConstruction)
    {
      this.prng = seedrandom(Math.random());
    }

    var voronoitreemap = await voronoiTreemap() 
                                      .clip([[0, 0], [0, view.height], [view.width, view.height], [view.width, 0]])
                                      .prng(this.prng);

    await voronoitreemap(root);
    this.createRootPolygon(root);
    view.showTreemap(this.root_polygon)
    view.displayLoading(false);
  }
  
  refresh() {
    view.viewport.removeChildren();
    view.resetViewItems();
    this.prng = seedrandom(this.seed);
  }

  assignWeights(leaves: HierarchyNode<any>[]) {
    leaves.forEach(function (leaf: HierarchyNode<any>) {
      if(!leaf.data.hasOwnProperty('weight') || leaf.data['weight'] == '') {
        //leaf.data['poly_weight'] = 100 / leaves.length;
        leaf.data['weight'] = 100 / leaves.length;
      }
      else
        return;
    });
    return;
  }

  hasUniqueParents(columns: string[]) {
    let requiredColumns = ['name', 'parent'];
    return requiredColumns.every(function (column: any = {}) {
      return columns.includes(column);
    });
  }

  hasNonUniqueParents(columns: string[]) {
    let requiredColumns = ['id', 'name', 'parentId'];
    return requiredColumns.every(function (column: any = {}) {
      return columns.includes(column);
    });
  }

  parseCsv(fileContent: any) {
    let parsingRes = csvParse(fileContent);
    let columns = parsingRes.columns;

    if(this.hasUniqueParents(columns)) {
      return stratify()
        .id(function (d:any = {}) { return d.name; })
        .parentId(function (d:any = {}) { return d.parent; })
        (parsingRes);
    } else if(this.hasNonUniqueParents(columns)) {
      return stratify()
        .id(function (d:any = {}) { return d.id; })
        .parentId(function (d:any = {}) { return d.parentId; })
        (parsingRes);
    }

    window.alert("Cannot parse CSV file!");
  }

  parseJson(fileContent: any) {
    let parsingRes = JSON.parse(fileContent);
    return hierarchy(parsingRes);
  }

  constructTreeFromFileSystem(path: string){
    //const constructedTree: dirTree.DirectoryTree = {} as dirTree.DirectoryTree;
    console.log("handling:", path)

    const constructedTree = dirTree(path);
    console.log(constructedTree);

    try {
      
    } catch (error) {
     console.error(error);
     console.log("Probably you entered an invalid path.")
     return;
    }
  }

  loadLastData(){
    switch(this.fileReloadSelector)
    {
      case 0:
        this.computeVoronoi(this.lastFileRead);
        break;
      case 1:
        this.loadExample(this.fileReloadSelector);
        break;
      case 2:
        this.loadExample(this.fileReloadSelector);
        break;
      case 3:
        this.loadExample(this.fileReloadSelector);
        break;
      case 4:
        this.loadExample(this.fileReloadSelector);
        break;
      case 5:
        this.loadExample(this.fileReloadSelector);
        break;
      case 6:
        this.loadExample(this.fileReloadSelector);
        break;
    }
  }


  checkName(polygon: Polygon)
  {
    if(polygon.name.indexOf('.') > -1 && (polygon.name.split('.'))[0] != "")
    {
      let file_extension = polygon.name.split('.')[polygon.name.split('.').length-1]
      switch(file_extension){
        case "json":
          polygon.name += '🧾'
          break;
        case "txt":
          polygon.name += '📄'
          break;
        case "html":
          polygon.name += '📑'
          break;
        case "doc":
          polygon.name += '📄'
          break;
        case "docx":
          polygon.name += '📄'
          break;
        case "pdf":
          polygon.name += '📕'
          break;
        case "xls":
          polygon.name += '📊'
          break;
        case "xlsx":
          polygon.name += '📊'
          break;
        case "ppt":
          polygon.name += '📈'
          break;
        case "pptx":
          polygon.name += '📈'
          break;
        case "csv":
          polygon.name += '📊'
          break;
        case "ts":
          polygon.name += '⌨️'
          break;
        case "js":
          polygon.name += '⌨️'
          break;
        case "css":
          polygon.name += '🎨'
          break;
        case "jpg":
          polygon.name += '🖼'
          break;
        case "jpeg":
          polygon.name += '🖼'
          break;
        case "png":
          polygon.name += '🖼'
          break;
        case "svg":
          polygon.name += '🖼'
          break;
        case "mp3":
          polygon.name += '🎵'
          break;
        case "wav":
          polygon.name += '🎵'
          break;
        case "zip":
          polygon.name += '🗃'
          break;
        case "exe":
          polygon.name += '💽'
          break;
        case "bin":
          polygon.name += '💽'
          break;
        case "py":
          polygon.name += '🖥'
          break;
        case "bat":
          polygon.name += '🖥'
          break;
        default:
          break;
      }
    }
  }

  setStaticConstruction(value: boolean)
  {
    this.staticConstruction = value;
  }


}