import { Polygon } from './polygon';
import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

export class Controller{

 private view = window.view;
 
  polgyonClick(x: number, y:number)
  {
    for(let polygon of model.current_root_polygon.polygon_children)
    {
      if (polygon.hitArea.contains(x, y)) {
        if(polygon.polygon_children.length == 0)
        {
          return;
        }
        if (polygon.polygon_parent == model.root_polygon) {
          view.active_parent_index = model.current_root_polygon.polygon_children.indexOf(polygon);
        }
        let size_ratio = this.calculateZoomFactor(polygon)
        view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(polygon.center.x, polygon.center.y), time: 1200, removeOnInterrupt: true});
        view.zoom_factor *= size_ratio;
        model.current_root_polygon = polygon;
        view.showTreemap(model.current_root_polygon);
        return;
      }
    }
    let parent = model.current_root_polygon.polygon_parent;
    let size_ratio = this.calculateZoomFactor(parent)
    view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * size_ratio, center: new PIXI.Point(parent.center.x, parent.center.y), time: 1200, removeOnInterrupt: true});
    view.zoom_factor *= size_ratio;
    model.current_root_polygon = parent;
    view.showTreemap(model.current_root_polygon);
    return;
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