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

  toString() {
    return `(${this.x}, ${this.y})`;
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
  radiusSlider = createSlider(1.05, 5, 2.0, 0.05).parent('radius').changed(update);
  checkbox = createCheckbox('Show points', false).parent('checkbox').changed(update);
  background(255);
  noLoop();
  update();
}

function draw() {
  clear();  
  stroke(0);
  
  const tick = performance.now();
  const points = generatePoints(nSlider.value(), radiusSlider.value(), iterSlider.value());
  const tock = performance.now();
  console.log(`generatePoints took ${tock-tick} millisec`);
  if (checkbox.checked()) {
    drawPoints(points);
  }
  drawMandala(points);
  const tack = performance.now();
  console.log(`drawing took ${tack-tock} millisec`);
}


function update() {
  nText.html(`N-Symmetry: ${nSlider.value()}`);
  iterText.html(`Iterations: ${iterSlider.value()}`);
  radiusText.html(`Radius: ${radiusSlider.value()}`);
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

  function isInternalCell(c) {
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
  cells.filter(c=>isInternalCell(c)).forEach(c=>drawCell(c));
}

function generatePoints(n, radius, iter) {
  const angles = Array(n).fill().map((_, idx)=>idx*2*Math.PI/n);
  const trigAngles = angles.map(a=>[Math.cos(a), Math.sin(a)]);

  function generatePointsInner(points, i, radiusAccumulator) {
    function ensureUniquePointsByJittering() {
      const jitterDelta = 1e-3;
      points = points.map(p=>new Point(p.x+jitterDelta*Math.random(), p.y+jitterDelta*Math.random()));
    }

    function fitPointsToCanvas() {
      const scaleFactor = 0.5*width/radiusAccumulator;
      points = points.map(p=>new Point(scaleFactor*p.x+width/2, scaleFactor*p.y+height/2));
    }

    if (iter==i) {
      fitPointsToCanvas();
      ensureUniquePointsByJittering();
      return points;
    }
    const r = Math.pow(radius,i+1);
    var newpoints = [];
    for(const p of points) {
      newpoints = newpoints.concat(trigAngles.map(a => new Point(p.x+r*a[0], p.y+r*a[1])));
    }
    // Does the same as above for loop, much faster
    // const newpoints = points.flatMap(p=>trigAngles.map(a=>new Point(p.x+r*a[0], p.y+r*a[1])));

    return generatePointsInner(newpoints, i+1, radiusAccumulator+r);
  }

  return generatePointsInner([new Point(0, 0)], 0, 0);
}
