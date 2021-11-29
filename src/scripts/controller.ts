import { Polygon } from './polygon';
import * as PIXI from 'pixi.js';

let ZOOMWIDTHRATIO = 0.65;

export class Controller{

  private view = window.view;
  
  public highlightedPolygon: Polygon = {} as Polygon;

  constructor()
  {
    const actualInput = <HTMLInputElement>document.getElementById("loadFile");
    actualInput.addEventListener("change", function(){
      model.computeVoronoi(actualInput.files);
    })

    document.getElementById("chooseFile")?.addEventListener("click", function(){actualInput.click();})

    // in case i want to use the settings button i'll need to expand on this
    // document.getElementById("settings-button")?.addEventListener("click", function(){
    //   let element = document.getElementById('settings-dropdown') as HTMLElement;
    //   if(element.style.display == "block"){element.style.display = "none";}
    //   else{element.style.display = "block";}
    // })
  }
 
  polgyonClick(x: number, y: number)
  {
    for(let child of model.current_root_polygon.polygon_children){
      if (child.hitArea.contains(x, y)) {
        if(child.polygon_children.length == 0){
          return;
        }
        this.moveTo(child);
        return;
      }
    }
    if(model.current_root_polygon != model.root_polygon){
      this.moveTo(model.current_root_polygon.polygon_parent);
      return;
    }
  }

  moveTo(target: Polygon){
    let ratio = this.calculateZoomFactor(target)
    view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * ratio, center: new PIXI.Point(target.center.x, target.center.y), time: 1200, removeOnInterrupt: true});
    this.setZoomFactor(target, ratio);
    view.showTreemap(model.current_root_polygon);
  }

  wheeled(e: any){
    if(e.dy < 0){
      let target: Polygon = {} as Polygon;
      for(let child of model.current_root_polygon.polygon_children){
        if (child.hitArea.contains(view.viewport.center.x, view.viewport.center.y)) {
          if(child.polygon_children.length == 0){
            break;
          }
          target = child;
          break;
        }
      }
    
      // console.log(target.name)
      // console.log(target.width)
      // console.log(view.viewport.screenWidthInWorldPixels * ZOOMWIDTHRATIO)
      // console.log('=============================')

      if(target != null
        && (view.viewport.screenWidthInWorldPixels * ZOOMWIDTHRATIO < target.width
            || view.viewport.screenWidthInWorldPixels == view.width)){
        let ratio = this.calculateZoomFactor(target)
        this.setZoomFactor(target, ratio)
        view.showTreemap(target);
      }
    }
    else if(model.current_root_polygon != model.root_polygon
      && view.viewport.screenWidthInWorldPixels * ZOOMWIDTHRATIO > model.current_root_polygon.width)
    {
      let ratio = this.calculateZoomFactor(model.current_root_polygon.polygon_parent)
      this.setZoomFactor(model.current_root_polygon.polygon_parent, ratio)
      view.showTreemap(model.current_root_polygon);
    }
  }

  setZoomFactor(target: Polygon, ratio: number){
    if(target == model.root_polygon){
      view.zoom_factor = 1
    }
    else{
      view.zoom_factor = (view.viewport.screenWidthInWorldPixels * ratio) / view.width;
    }
    model.current_root_polygon = target;
  }

  calculateZoomFactor(polygon: Polygon){
    let xmin = polygon.points[0].x;
    let xmax = polygon.points[0].x;
    let ymin = polygon.points[0].y;
    let ymax = polygon.points[0].y;
    for(let p of polygon.points){
      if (p.x < xmin){
        xmin = p.x;
      }
      else if(p.x > xmax){
        xmax = p.x;
      }

      if (p.y < ymin){
        ymin = p.y;
      }
      else if(p.y > ymax){
        ymax = p.y;
      }
    }
    let x_ratio = (xmax - xmin) / view.viewport.worldScreenWidth;
    let y_ratio = (ymax - ymin) / view.viewport.worldScreenHeight;
    let larger_ratio = x_ratio >= y_ratio ? x_ratio : y_ratio;
    return larger_ratio;
  }
}