var nSlider;
var nText;
var iterSlider;
var iterText;
var radiusSlider;
var radiusText;
var checkbox;

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
  points.forEach(p=>circle(p.x, p.y, 3))
}

function drawMandala(points) {
  noFill();
  stroke(0);

  function getVoronoiSites(sourcePoints, jitterDelta = 0) {
    const unique = new Set();
    const sites = [];
    const keyPrecision = 1e4;

    sourcePoints.forEach((p, idx) => {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        return;
      }

      // When needed, add a tiny deterministic offset to break geometric ties.
      const xj = p.x + jitterDelta * Math.sin((idx + 1) * 12.9898);
      const yj = p.y + jitterDelta * Math.cos((idx + 1) * 78.233);
      const x = constrain(xj, 1e-3, width - 1e-3);
      const y = constrain(yj, 1e-3, height - 1e-3);
      const key = `${Math.round(x * keyPrecision)},${Math.round(y * keyPrecision)}`;

      if (unique.has(key)) {
        return;
      }

      unique.add(key);
      sites.push([x, y]);
    });

    return sites;
  }

  function isInternalCell(c) {
    return c.reduce((inside,p)=>(inside && p[0]>1 && p[0]<width-1 && p[1]>1 && p[1]<height-1), true);
  }

  function drawCell(cell) {
    beginShape();
    cell.forEach(v=>vertex(v[0], v[1]))
    endShape(CLOSE);
  }

  let sites = getVoronoiSites(points);
  if (sites.length < 2) {
    return;
  }

  try {
    voronoiClearSites();
    voronoiSites(sites);
    voronoi(width, height);
  } catch (err) {
    console.warn('Voronoi failed with base points; retrying with tie-break jitter.', err);
    sites = getVoronoiSites(points, 1e-3);
    if (sites.length < 2) {
      return;
    }
    voronoiClearSites();
    voronoiSites(sites);
    voronoi(width, height);
  }

  const cells = voronoiGetCells();
  cells.filter(c=>isInternalCell(c)).forEach(c=>drawCell(c));
}

function generatePoints(n, radius, iter) {
  const angles = Array(n).fill().map((_, idx)=>idx*2*Math.PI/n);
  const trigAngles = angles.map(a=>[Math.cos(a), Math.sin(a)]);

  function generatePointsInner(points, i, radiusAccumulator) {
    function ensureUniquePointsByJittering() {
      const jitterDelta = 1e-3;
      // Deterministic seeded random based on point coordinates and index.
      function seededRandom(x, y, salt) {
        // Magic constants (12.9898, 78.233) mix x,y to avoid patterns
        // Math.sin() adds non-linearity; 43758.5453 scales output for better distribution
        // Fractional part (- Math.floor) returns value in [0,1)
        const seed = Math.sin(x * 12.9898 + y * 78.233 + salt * 37.719) * 43758.5453;
        return seed - Math.floor(seed);
      }

      points = points.map((p, idx)=>({
        x: p.x + jitterDelta * (seededRandom(p.x, p.y, idx) - 0.5),
        y: p.y + jitterDelta * (seededRandom(p.x + 0.5, p.y + 0.5, idx + 1) - 0.5)
      }));
    }

    function fitPointsToCanvas() {
      const scaleFactor = 0.5*width/radiusAccumulator;
      points = points.map(p=>({x: scaleFactor*p.x+width/2, y: scaleFactor*p.y+height/2}));
    }

    if (iter==i) {
      fitPointsToCanvas();
      ensureUniquePointsByJittering();
      return points;
    }
    const r = Math.pow(radius,i+1);
    var newpoints = [];
    for(const p of points) {
      newpoints = newpoints.concat(trigAngles.map(a =>({x: p.x+r*a[0], y: p.y+r*a[1]})));
    }
    // Does the same as above for loop, much faster
    // const newpoints = points.flatMap(p=>trigAngles.map(a=>({x: p.x+r*a[0], y: p.y+r*a[1]})));

    return generatePointsInner(newpoints, i+1, radiusAccumulator+r);
  }

  return generatePointsInner([{x: 0, y: 0}], 0, 0);
}
