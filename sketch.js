var nSlider;
var nText;
var iterSlider;
var iterText;
var radiusSlider;
var radiusText;
var checkbox;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function setup() {
  const mindim = min(window.innerWidth, window.innerHeight);
  let canvas = createCanvas(mindim, mindim);
  canvas.parent('mandala');
  
  nText = createP('N-symmetry: ').parent('symmetry');
  nSlider = createSlider(3,7,5,1).parent('symmetry').changed(update);
  iterText = createP('Iterations: ').parent('iterations');
  iterSlider = createSlider(2,5,4,1).parent('iterations').changed(update);
  radiusText = createP('Radius: ').parent('radius');
  radiusSlider = createSlider(0.1,5,2.5,0.05).parent('radius').changed(update);
  checkbox = createCheckbox('Show points', false).parent('checkbox').changed(update);
  background(255);
  noLoop();
  update();
}

function draw() {
  clear();  
  stroke(0);
  
  let points = generatePoints([new Point(0,0)], nSlider.value(), radiusSlider.value(), iterSlider.value(), 0);

  if (checkbox.checked()) {
    drawPoints(points);
  }
  drawMandala(points);
}


function update() {
  nText.html('N-Symmetry: ' + nSlider.value());
  iterText.html('Iterations: ' + iterSlider.value());
  radiusText.html('Radius: ' + radiusSlider.value());
  redraw();
}

function drawPoints(points) {
  stroke('red');
  fill('red');
  for(const p of points) {
    circle(p.x, p.y, 3);
  }
}

function drawMandala(points) {
  noFill();
  stroke(0);

  function cellTouchesBoundary(c) {
    return c.reduce((inside,p)=>(inside && p[0]>1 && p[0]<width-1 && p[1]>1 && p[1]<height-1), true);
  }

  function drawCell(cell) {
    beginShape();
    for (var j = 0; j < cell.length; j++) {
        vertex(cell[j][0], cell[j][1]);
    }
    endShape(CLOSE);
    
  }

  voronoiClearSites();
  voronoiSites(points.map(p=>[p.x, p.y]));
  voronoi(width, height);
  
  cells = voronoiGetCells()
  cells.filter(c=>cellTouchesBoundary(c)).forEach(c=>drawCell(c));
}

function generatePoints(initialPoints, n, radius, iter, i) {
  points = initialPoints;

  function ensureUniquePointsByJittering() {
    points = points.map(p=>new Point(p.x+Math.random()/1000, p.y+Math.random()/1000));
  }

  function fitPointsToCanvas() {
    const extreme = 2.2*points.reduce((m, p)=> max(m, max(Math.abs(p.x), Math.abs(p.y))), 0);
    points = points.map(p=>new Point((width/extreme)*p.x+width/2, (height/extreme)*p.y+height/2));
  }

  if (iter==i) {
    fitPointsToCanvas();
    ensureUniquePointsByJittering();
    return points;
  }

  let angles = Array(n).fill().map((_, idx)=>idx*2*Math.PI/n);

  var newpoints = [];
  for(const p of points) {
    newpoints = newpoints.concat(angles.map(a => new Point(p.x+Math.pow(radius,i+1)*Math.cos(a), p.y+Math.pow(radius,i+1)*Math.sin(a))));
  }
  return generatePoints(newpoints, n, radius, iter, i+1);
}

