import { Polygon } from './polygon';
import { Point } from './point';
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import {csv, json} from "d3-fetch";
import { voronoiTreemap } from "d3-voronoi-treemap";
import {csvParse} from "d3-dsv";
import chroma = require('chroma-js');

var seedrandom = require('seedrandom');
let AQUAMARINE = chroma.scale(['#80ff80', '#80ff9f', '#80ffbf', '#7fffd4', '#80ffdf', '#80ffff', '#80dfff', '#80bfff']);
let RAINBOW = chroma.scale(['red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'purple']);
// let GRAYSCALE = chroma.scale(['#e6e6e6', '#cccccc', '#b3b3b3', '#999999', '#808080', '#737373', '#595959']);
let Y_SCALE = chroma.scale(['#000000', '#7d7d7d']);
let TYPE_LIST: indexList = {
  [""]:     {color: 8553090, emoji: ""},
  ["json"]: {color: 5277806, emoji: "🧾"},
  ["txt"]:  {color: 4214431, emoji: "📄"},
  ["html"]: {color: 16208929, emoji: "📑"}, 
  ["doc"]:  {color: 1325534, emoji: "📄"}, 
  ["docx"]: {color: 1325534, emoji: "📄"}, 
  ["pdf"]:  {color: 11340544, emoji: "📕"},
  ["xls"]:  {color: 1929026, emoji: "📊"},
  ["xlsx"]: {color: 1929026, emoji: "📊"}, 
  ["ppt"]:  {color: 13648931, emoji: "📈"},
  ["pptx"]: {color: 13648931, emoji: "📈"}, 
  ["csv"]:  {color: 4827469, emoji: "📊"},
  ["ts"]:   {color: 3242182, emoji: "⌨️"}, 
  ["js"]:   {color: 16244760, emoji: "⌨️"}, 
  ["css"]:  {color: 2730723, emoji: "🎨"},
  ["jpg"]:  {color: 6710988, emoji: "🖼️"},
  ["jpeg"]: {color: 6710988, emoji: "🖼️"}, 
  ["png"]:  {color: 15588985, emoji: "🖼️"},
  ["svg"]:  {color: 16757560, emoji: "🖼️"},
  ["mp3"]:  {color: 15751043, emoji: "🎵"},
  ["wav"]:  {color: 292293, emoji: "🎵"},
  ["zip"]:  {color: 16770452, emoji: "🗃️"},
  ["exe"]:  {color: 13697191, emoji: "💽"},
  ["bin"]:  {color: 9533697, emoji: "💽"},
  ["py"]:   {color: 65301, emoji: "⚙️"}, 
  ["bat"]:  {color: 7639471, emoji: "⚙️"},
}


export class Model{
  public currentPolygonID: number = 0;
  public root_polygon: Polygon = {} as Polygon;
  public current_root_polygon: Polygon = {} as Polygon;
  public lastFileRead: any;
  public fileReloadSelector: number = -1;
  public staticConstruction: boolean = true;
  public staticFontSize: boolean = false;
  public seed: number = Math.random();
  public prng = seedrandom(this.seed);
  public weight_attribute: string = 'weight'; 


  loadExample(ex: number) {
    this.refresh();
    view.displayLoading(true);
    let dropdown = document.getElementById('examples-dropdown') as HTMLElement;
    dropdown.style.display = "none"; 

    if (ex == 1) {
      json('data/world_gdp.json')
        .then((jsonData) => {
          let root = hierarchy(jsonData);
          this.assignWeights(root.leaves(), this.weight_attribute);
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
          this.assignWeights(root.leaves(), this.weight_attribute);
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
            this.assignWeights(root.leaves(), this.weight_attribute);
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
          this.assignWeights(root.leaves(), this.weight_attribute);
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
          this.assignWeights(root.leaves(), this.weight_attribute);
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
            this.assignWeights(root.leaves(), this.weight_attribute);
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

      let name = this.getName(node.data);
      let type: string = name.split('.')[name.split('.').length-1];
      let color3 = TYPE_LIST[type]?.color;
      if(color3 == undefined){color3 = TYPE_LIST[""].color};

      let color = [color1, color2, color3]

      let new_poly = Polygon.from(poly, poly.site, rootPolygon, color, this.getPath(node.data));
      new_poly.polygon_parent = rootPolygon;
      new_poly.name = name;
      this.checkNameForFileType(new_poly);

      rootPolygon.polygon_children.push(new_poly);
      this.treemapToPolygons(new_poly, node, false);
      i++;
    }
  }

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

            this.assignWeights(root.leaves(), this.weight_attribute);
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

  assignWeights(leaves: HierarchyNode<any>[], attribute: string) {
    
    this.setAttributeButtons(leaves[0]);

    if(attribute == 'weight' && !leaves[0].data.hasOwnProperty('weight') || leaves[0].data['weight'] == '') {
      leaves.forEach(function (leaf: HierarchyNode<any>) {
        leaf.data['weight'] = 100 / leaves.length;
        model.weight_attribute = 'children';
      });
    }
    else if(attribute == 'children'){
      leaves.forEach(function (leaf: HierarchyNode<any>) {
        leaf.data['weight'] = 100 / leaves.length;
        model.weight_attribute = 'children';
      });
    }
    else if(attribute != 'weight'){
      leaves.forEach(function (leaf: HierarchyNode<any>) {
        leaf.data['weight'] = leaf.data[attribute];
        model.weight_attribute = attribute;
      });
    }
    else if(attribute == 'weight'){model.weight_attribute = 'weight';}

    let active = document.getElementById(this.weight_attribute) as HTMLInputElement;
    if(active!=null){active.checked = true}

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


  checkNameForFileType(polygon: Polygon)
  {
    if(polygon.name.indexOf('.') > -1 && (polygon.name.split('.'))[0] != "")
    {
      let file_extension = polygon.name.split('.')[polygon.name.split('.').length-1]
      if(TYPE_LIST[file_extension] != undefined)
      {
        polygon.name = TYPE_LIST[file_extension].emoji + polygon.name;
      }
    }
  }

  setStaticConstruction(value: boolean){
    this.staticConstruction = value;
  }

  setFontSizeStatic(value: boolean){
    this.staticFontSize = value;
    view.showTreemap(model.current_root_polygon);
  }

  setWeightAttribute(value: string){
    this.weight_attribute = value;
    this.loadLastData();
  }

  setAttributeButtons(leaf: HierarchyNode<any>){
    let settings_element = document.getElementById('settings-dropdown');
    let oldbuttons = document.getElementsByClassName('weightedattribute');
    while(oldbuttons.length > 0){
      settings_element?.removeChild(oldbuttons[0]);
    }

    // add no. of children button
    let element = document.createElement("input");
    element.onclick = (e) => model.setWeightAttribute('children');
    element.type = "radio"
    element.name = "attribute"
    element.classList.add('radioButtons');
    element.classList.add('dropdown-element');
    element.classList.add('weightedattribute');
    element.id = "children";
    element.value = "children";

    let label = document.createElement("label");
    label.htmlFor = "children";
    label.appendChild(document.createTextNode('no. of children'));
    label.classList.add('weightedattribute');
    label.classList.add('dropdown-element');

    settings_element?.appendChild(element);
    settings_element?.appendChild(label);

    //add a button for every available attribute
    let keys = Object.keys(leaf.data);
    for (let index = 0; index < keys.length; index++) {
      if(Number.isFinite(leaf.data[keys[index]]))
      {
        let element = document.createElement("input");
        element.onclick = (e) => model.setWeightAttribute(keys[index]);
        element.type = "radio"
        element.name = "attribute"
        element.classList.add('radioButtons');
        element.classList.add('dropdown-element');
        element.classList.add('weightedattribute');
        element.id = keys[index];
        element.value = keys[index];

        let label = document.createElement("label");
        label.htmlFor = keys[index];
        label.classList.add('weightedattribute');
        label.classList.add('dropdown-element');
        label.appendChild(document.createTextNode(keys[index]));

        settings_element?.appendChild(element);
        settings_element?.appendChild(label);
      }
    }
  }
}