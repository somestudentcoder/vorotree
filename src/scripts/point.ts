import {Polygon} from "./polygon";

export class Point{
  public x:number;
  public y:number;

  constructor(x_coord: number, y_coord: number) {
    this.x = x_coord;
    this.y = y_coord;
  }


  // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  computeIntersection(p_plus_r: Point, edge: Array<Point>, strict?: boolean){
    let r = new Point(p_plus_r.x - this.x, p_plus_r.y - this.y);
    let q = edge[0];
    let s = edge[1];

    let q_minus_p = new Point(q.x - this.x, q.y - this.y);
    let r_x_s = Point.crossProdcut(r, s);
    let q_minus_p_x_s = Point.crossProdcut(q_minus_p, s);
    let q_minus_p_x_r = Point.crossProdcut(q_minus_p, r);

    let t = q_minus_p_x_s / r_x_s;
    let u = q_minus_p_x_r / r_x_s;

    if(r_x_s != 0){
      if(strict){
        if(Math.abs(t) <= 1 && Math.abs(u) <= 1){
          return new Point(this.x + t * r.x, this.y + t * r.y);
        }
        else{
          console.log("ERROR");
          return new Point(-1, -1);
        }
      }
      else{
        let result = new Point(this.x + t * r.x, this.y + t * r.y);
        //console.log("result: " + JSON.stringify(result, null, 4))
        return result;
      }
    }
    return new Point(-1, -1);

  }

  // https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
  left_of_line(edge: Array<Point>) {
    let a = edge[0];
    let b = new Point(edge[0].x + edge[1].x, edge[0].x + edge[1].y);

    let cross_product = (this.x - a.x) * (b.y - a.y) - (this.y - a.y) * (b.x - a.x);
    if(cross_product < 0){
      //point lies left of line
      return true;
    }
    else if(cross_product > 0){
      //point lies right of line
      return false;
    }
    else{
      //Point lies exactly on line
      return true
    }
  }


  static distance(p1: Point, p2: Point){
    let vector = new Point(p1.x - p2.x, p1.y - p2.y);
    let d = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    return d;
  }


  static crossProdcut(p1: Point, p2: Point){
    return p1.x * p2.y - p1.y * p2.x;
  }
}