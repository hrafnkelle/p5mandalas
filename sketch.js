var points = [[0, 0]];

const iter=5;
const n=5;
let angles = Array(n).fill().map((_, idx)=>idx*2*Math.PI/n);
let radius = 2.9;

function setup() {
  const mindim = min(window.innerWidth, window.innerHeight);
  createCanvas(mindim, mindim);

  background(255);
  for(let i=1; i<=iter; i++) {
    var newpoints = [];
    for(const p of points) {
      newpoints = newpoints.concat(angles.map(a => [p[0]+Math.pow(radius,i)*Math.cos(a), 
                                                    p[1]+Math.pow(radius,i)*Math.sin(a)]));
    }
    points = newpoints;
  }
  points = points.map(p => [p[0]+width/2, p[1]+height/2]);
  voronoiSites(points);
  voronoi(width, height);
}

function draw() {
  stroke(0);
  
  var target = voronoiGetCells();
  for (var i = 0; i < target.length; i++) {
    //Shape
    beginShape();
    for (var j = 0; j < target[i].length; j++) {
      if ((target[i][j][0]>1)&&(target[i][j][0]<width-1)&&(target[i][j][1]>1)&&(target[i][j][1]<height-1)) { 
        vertex(target[i][j][0], target[i][j][1]);
      } 
    }
    endShape(CLOSE);
  }
  //voronoiDraw(0, 0, false, false);

  // translate(width/2, height/2);
  // for(const p of points) {
  //   circle(p[0], p[1], 2);
  // }
}
