import { Point } from './point';
import {Delaunay} from "d3-delaunay";
import * as PIXI from 'pixi.js';

export class Polygon extends PIXI.Graphics{
  public center: Point = new Point(0,0);
  public points: Array<Point> = [];
  public polygon_children: Array<Polygon> = [];
  public polygon_parent: Polygon = {} as Polygon;
  public color: number = -1;
  public id: number = -1;
  public weight: number = -1;
  public name: string = "";

  static from(d3_poly: Delaunay.Polygon, center_: Point, parent_?: Polygon, color_?: number){
    let poly = new Polygon();
    let ps = [];
    for(let point of d3_poly){
      let x = point[0];
      let y = point[1];
      ps.push(new Point(x, y));
    }
    if(ps[0].x != ps[ps.length - 1].x || ps[0].y != ps[ps.length - 1].y){
      ps.push(ps[0]);
    }
    poly.points = ps;
    poly.color = color_ == undefined ? view.getColor() : color_;
    poly.id = model.currentPolygonID;
    model.currentPolygonID++;
    poly.polygon_parent = parent_ == undefined ?  {} as Polygon : parent_;
    poly.center = center_;
    return poly;
  }

  init(points_: Array<Point>, colorIndex: number)
  {
    this.points = points_;
    this.color = view.getColor();
    this.id = model.currentPolygonID;
    model.currentPolygonID++;
  }



}