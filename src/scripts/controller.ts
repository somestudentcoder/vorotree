import { Polygon } from './polygon';
import * as PIXI from 'pixi.js';

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
    let size_ratio = this.calculateZoomFactor(target)
    view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(target.center.x, target.center.y), time: 1200, removeOnInterrupt: true});
    view.zoom_factor *= size_ratio;
    model.current_root_polygon = target;
    view.showTreemap(model.current_root_polygon);
  }

  wheeled(e: any)
  {
    // console.log(view.zoom_factor)

    if(e.dy < 0){
      this.polgyonClick(controller.highlightedPolygon.center.x, controller.highlightedPolygon.center.y);
    }
    else if(model.current_root_polygon != model.root_polygon)
    {
      this.moveTo(model.current_root_polygon.polygon_parent);
    }
    else{
      return;
    }
    // console.log(view.zoom_factor)
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