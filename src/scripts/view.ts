import * as PIXI from 'pixi.js';
import { Polygon } from './polygon';
import { Point } from './point';
import { Viewport } from 'pixi-viewport';


import {HierarchyNode} from "d3-hierarchy";

export class View{

  //public renderer: PIXI.Renderer;
  public app: PIXI.Application;
  public stage: PIXI.Container;
  public width: number;
  public height: number;

  private color_counter: number;
  private colorArray: Array<number>;
  private model = window.model;
  private controller = window.controller;
  private text_list: Array<PIXI.Text>;
  private active_shapes: Array<Polygon>;
  private root_outline: Polygon;
  public active_parent_index: number;
  public zoom_factor: number = 1;

  public viewport: Viewport;



  constructor()
  {
    //init pixi
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.app = new PIXI.Application({width: this.width, height: this.height, resolution: window.devicePixelRatio,
      autoDensity: true, view: <HTMLCanvasElement>document.getElementById("theCanvas"), backgroundColor: 0xFFFFFF});
    document.body.appendChild(this.app.view)
    //window.addEventListener('resize', this.resize);

    //init stage & text containers
    this.stage = new PIXI.Container();

    this.colorArray =[];
    this.color_counter = 0;
    this.viewport = new Viewport(
      {
        screenWidth: this.width,
        screenHeight: this.height,
        worldWidth: this.width,
        worldHeight: this.height,
        interaction: this.app.renderer.plugins.interaction
      }
    )
    this.app.stage.addChild(this.viewport);

    this.viewport
      .bounce()
      .drag()
      .wheel()
      .pinch()
      .decelerate()
      .clamp({ direction: 'all' })
      .clampZoom({maxWidth: this.width, maxHeight:this.height})

    this.viewport.on('clicked', (e) => controller.polgyonClick(e.world.x, e.world.y));

    this.text_list = [];
    this.active_shapes = [];
    this.active_parent_index = {} as number;
    this.root_outline = new Polygon();

    this.app.renderer.render(this.app.stage);
  }

  // Not used. Served as starting point.
  /*
  drawPoints(list: Array<Point>)
  {
    for(let p of list)
    {
      let dot = new PIXI.Graphics();
      dot.beginFill(0xff00ff);
      dot.x = 0;
      dot.y = 0;
      this.stage.addChild(dot);
      dot.drawCircle(p.x, p.y, 5);
      dot.endFill();
    }
    this.app.renderer.render(this.stage);
  }
  */
 
  drawPolygons(list: Array<Polygon>, upper: boolean)
  {
    for(let shape of list)
    {
      let coord_list = [];
      for(let element of shape.points)
      {
        coord_list.push(element.x);
        coord_list.push(element.y);
      }

      shape.clear();

      shape.beginFill(shape.color);
      shape.lineStyle(3 * this.zoom_factor,0,1,0,false);
      shape.drawPolygon(coord_list);
      shape.endFill();

      if (upper) {
        shape.alpha = 1;
        if(!shape.hitArea)
        {
          shape.hitArea = new PIXI.Polygon(coord_list);          
        }
        shape.interactive = true;
        shape.buttonMode = true;

        shape.on('mouseover', function(){
          shape.alpha = 0.8;
          shape.polygon_parent.alpha = 0;
        });

        shape.on('mouseout', function(){
          shape.alpha = 1;
          shape.parent.alpha = 1;
        });
      }
      else
      {
        shape.off('mouseover');
        shape.off('mouseout');
        shape.interactive = false;
        shape.buttonMode = false;
        shape.alpha = 0.3;
      }
      this.viewport.addChild(shape);
    }
  }


  drawText(root: Polygon)
  {
    //cleanup
    for(let text of this.text_list)
    {
      this.viewport.removeChild(text);
      text.destroy;
    }
    this.text_list = [];

    //drawing
    if(root.polygon_children.length != 0)
    {
      for(let polygon of root.polygon_children)
      {
        let text = new PIXI.Text(polygon.name, {fill: 0xffffff,  stroke: 0x000000, strokeThickness: (0.5 + this.zoom_factor*2), fontSize: Math.floor((20 + polygon.weight * 2)* this.zoom_factor) +3});
        text.anchor.set(0.5);
        text.resolution = 2 * (1/this.zoom_factor);
        text.position.set(polygon.center.x, polygon.center.y);
        let box = text.getLocalBounds(new PIXI.Rectangle);
        if(polygon.center.x - (box.width / 2) < 0)
        {
          let new_x = polygon.center.x + ((polygon.center.x - (box.width / 2)) * -1);
          text.position.set(new_x, polygon.center.y)
        }
        else if(polygon.center.x + (box.width / 2) > this.width)
        {
          let new_x = polygon.center.x - ((polygon.center.x + (box.width / 2) - this.width));
          text.position.set(new_x, polygon.center.y)
        }  
        this.text_list.push(text);
        this.viewport.addChild(text);
      }
      this.app.renderer.render(this.stage);
    }
  }

  destroyAllChildren(polygon: Polygon)
  {
    let list = polygon.removeChildren();
    for(let text of list)
    {
      text.destroy()
    }
  }

  //POSSIBILITY FOR LATER https://stackoverflow.com/questions/30554533/dynamically-resize-the-pixi-stage-and-its-contents-on-window-resize-and-window
  resize()
  {
    let w = this.app.renderer.width;
    let h = this.app.renderer.height;

    let _w = window.innerWidth * 0.95;
    let _h = window.innerHeight * 0.95;

    this.app.renderer.resize(_w, _h);
    //shape.scale.set(w/_w, h/_h);
    this.app.renderer.render(this.stage);
  }

  initColorArray(points:number)
  {
    this.colorArray = [];
    
    let counter = 0
    while(counter < points)
    {
      let color = Math.floor(Math.random() * 16777215);
      if(this.colorArray.includes(color))
      {
        continue;
      }
      else{
        this.colorArray.push(color);
        counter++;
      }
    }
  }

  getColor()
  {
    let color = this.colorArray[this.color_counter];
    this.color_counter++;
    return color;
  }

  resetViewItems()
  {
    this.color_counter = 0;
    this.active_shapes = [];
    this.text_list = [];
    this.zoom_factor = 1;
    this.viewport.setZoom(1);
  }

  resetViewpoint()
  {
    this.model.current_root_polygon = this.model.root_polygon;
    this.active_shapes = [];
    this.text_list = [];
    this.viewport.setZoom(1);
    this.zoom_factor = 1;
    view.viewport.removeChildren();
    view.app.renderer.render(view.app.stage);
    this.showTreemap(model.root_polygon)
  }

  showTreemap(root: Polygon){
    //cleanup
    for(let shape of this.active_shapes)
    {
      this.viewport.removeChild(shape);
    }
    this.active_shapes = [];

    //drawing
    //taking care of outer layer when zooming in
    if(root != model.root_polygon && root.polygon_parent != model.root_polygon)
    {
      let list = [...model.root_polygon.polygon_children];
      //list.splice(this.active_parent_index, 1);
      this.drawPolygons(list, true);
      this.active_shapes = this.active_shapes.concat(list);
    }

    //drawing parents and children
    if (Object.keys(root.polygon_parent).length !== 0){
      this.drawPolygons(root.polygon_parent.polygon_children, true);
      this.active_shapes = this.active_shapes.concat(root.polygon_parent.polygon_children);
    }
    if (root.polygon_children.length != 0) {
      this.drawPolygons(root.polygon_children, true);
      this.active_shapes = this.active_shapes.concat(root.polygon_children);
      for(let child of root.polygon_children){
        if (child.polygon_children.length != 0) {
          this.drawPolygons(child.polygon_children, false);
          this.active_shapes = this.active_shapes.concat(child.polygon_children);
        }
      }
    }
    if(model.current_root_polygon != model.root_polygon)
    {
      this.drawRootLines();      
    }
    this.drawText(root);
    this.displayLoading(false)
  }

  drawRootLines()
  {
    if (!(this.root_outline == null)) {
      this.root_outline.clear()
    }
    let coord_list = []
    for(let element of model.current_root_polygon.points)
    {
      coord_list.push(element.x);
      coord_list.push(element.y);
    }
    this.root_outline.lineStyle((3*this.zoom_factor) + 2,0,1,0,false);
    this.root_outline.drawPolygon(coord_list);
    this.active_shapes.push(this.root_outline);
    this.viewport.addChild(this.root_outline);
  }

  displayLoading(b: boolean)
  {
    let loading: HTMLElement = document.getElementById('loading')!;
    if(b)
    {
      loading.style.display = "inline-block";
    }else
    {
      loading.style.display = "none";
    }
  }
}