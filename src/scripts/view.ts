import * as PIXI from 'pixi.js';
import { Polygon } from './polygon';
import { Viewport } from 'pixi-viewport';


export class View{
  public app: PIXI.Application;
  public width: number;
  public height: number;
  public offset: number;

  private model = window.model;
  private text_list: Array<PIXI.Text>;
  private active_shapes: Array<Polygon>;
  private root_outline: Polygon;
  public zoom_factor: number = 1;

  public viewport: Viewport;

  public color_selector: number = 0;



  constructor()
  {
    //init pixi
    this.width = window.innerWidth;
    this.offset = document.getElementById('site-header')?.offsetHeight as number;
    this.height = window.innerHeight - this.offset;
    this.app = new PIXI.Application({width: this.width, height: this.height, resolution: window.devicePixelRatio,
      autoDensity: true, view: <HTMLCanvasElement>document.getElementById("theCanvas"), backgroundColor: 0xFFFFFF, resizeTo: window});
    document.body.appendChild(this.app.view)

    var timer: NodeJS.Timeout;
    window.addEventListener('resize', function(){
      clearTimeout(timer);
      timer = setTimeout(view.resize, 500);
    });

    //init stage & text containers
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
    this.viewport.on('pinch-start', (e) => controller.pinchStart());
    this.viewport.on('pinch-end', (e) => controller.pinched());
    this.viewport.on('wheel', (e) => controller.wheeled(e.wheel, controller.highlightedPolygon.center.x, controller.highlightedPolygon.center.y));

    this.text_list = [];
    this.active_shapes = [];
    this.root_outline = new Polygon();

    this.app.renderer.render(this.app.stage);
  }
 
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

      shape.beginFill(shape.color[this.color_selector]);
      shape.lineStyle(2 * this.zoom_factor,0,1,0,false);
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
          controller.highlightedPolygon = shape;
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


  drawLabels(root: Polygon)
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
        let font_size = undefined;
        if(model.staticFontSize){
          if(model.root_polygon == model.current_root_polygon){font_size = 25}
          else {font_size = model.current_root_polygon.width * 0.04;}
        }
        else{font_size = 1 + polygon.width / 11;}
        let text = new PIXI.Text(polygon.name, {fill: 0xffffff,  stroke: 0x000000, strokeThickness: (0.25 + this.zoom_factor), fontSize: font_size});
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
    view.app.resize();
    view.offset = document.getElementById('site-header')?.offsetHeight as number;
    view.height = view.app.view.height - view.offset;
    view.width = view.app.view.width;
    view.height /= window.devicePixelRatio;
    view.width /= window.devicePixelRatio;
    view.resetViewItems();



    view.viewport.clampZoom({maxWidth: view.width, maxHeight:view.height})
    view.viewport.resize(view.width, view.height,view.width, view.height);
    //view.app.renderer.resize(view.width, view.height)
    //view.viewport.scale.set(1)

    model.loadLastData();
  }

  setColorScheme(selector: number)
  {
    this.color_selector = selector-1;
    this.showTreemap(this.model.current_root_polygon);
  }

  resetViewItems()
  {
    this.active_shapes = [];
    this.text_list = [];
    this.zoom_factor = 1;
    this.viewport.setZoom(1);
  }

  resetViewpoint()
  {
    view.model.current_root_polygon = model.root_polygon;
    view.active_shapes = [];
    view.text_list = [];
    view.viewport.setZoom(1);
    view.zoom_factor = 1;
    view.viewport.removeChildren();
    view.app.renderer.render(view.app.stage);
    view.showTreemap(model.root_polygon)
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
    this.drawLabels(root);
    this.app.renderer.render(this.app.stage)
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
    this.root_outline.lineStyle(5 * this.zoom_factor,0,1,0,false);
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