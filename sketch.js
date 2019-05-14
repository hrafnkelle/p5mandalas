let iter=5;
let n=5;
let radius = 2.9;
var nSlider;
var nText;
var iterSlider;
var iterText;
var checkbox;
var points = [];

// solutions of r^n+r^(n-1)+..r=0.4
// which are possible radii of mandala so that it fits in a
// box bounded by -0.5..0.5 in widht and height
// n is the iteration count selected
let radii = [0.286, 0.287, 0.291, 0.306, 0.4]

function setup() {
  const mindim = min(window.innerWidth, window.innerHeight);
  let canvas = createCanvas(mindim, mindim);
  canvas.parent('mandala');
  
  nText = createP('N-symmetry: ').parent('ui');
  nSlider = createSlider(3,7,5,1).parent('ui').changed(update);
  iterText = createP('Iterations: ').parent('ui');
  iterSlider = createSlider(2,5,4,1).parent('ui').changed(update);
  checkbox = createCheckbox('Show points', false).parent('ui').changed(update);
  background(255);
  noLoop();
  update();
}

function draw() {
  clear();  
  stroke(0);
  
  generatePoints();

  if (checkbox.checked()) {
    drawPoints();
  }
  drawMandala();
}


function update() {
  nText.html('N-Symmetry: ' + nSlider.value());
  iterText.html('Iterations: ' + iterSlider.value());
  redraw();
}

function drawPoints() {
  stroke('red');
  fill('red');
  for(const p of points) {
    circle(p[0], p[1], 3);
  }
}

function drawMandala() {
  noFill();
  stroke(0);
  voronoiClearSites();
  voronoiSites(points);
  voronoi(width, height);
  
  var target = voronoiGetCells();
  for (var i = 0; i < target.length; i++) {
    beginShape();
    for (var j = 0; j < target[i].length; j++) {
      if ((target[i][j][0]>1)&&(target[i][j][0]<width-1)&&(target[i][j][1]>1)&&(target[i][j][1]<height-1)) { 
        vertex(target[i][j][0], target[i][j][1]);
      } 
    }
    endShape(CLOSE);
  }
}

function generatePoints() {
  points = [[0, 0]];
  n = nSlider.value();
  iter = iterSlider.value();
  let angles = Array(n).fill().map((_, idx)=>idx*2*Math.PI/n);
  
  for(let i=0; i<iter; i++) {
    var newpoints = [];
    for(const p of points) {
      newpoints = newpoints.concat(angles.map(a => [p[0]+Math.pow(radii[i],i+1)*Math.cos(a), p[1]+Math.pow(radii[i],i+1)*Math.sin(a)]));
    }
    points = newpoints;
  }
  points = points.map(p=>[width*p[0]+width/2, height*p[1]+height/2]);
}

