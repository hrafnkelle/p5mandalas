## Mandala generator

This is a Mandala generator sketch written in [p5.js](https://p5js.org/).
It also uses the [p5.vornoi library](https://github.com/Dozed12/p5.voronoi).

The concept is to generate a set of points on a circle, then regenerate new points on circles with the points from the previous iteration as centers. This is iterated a few times. A voronoi diagram of the resulting set of points is then the Mandala.

This was inspired by a [blogpost by Fronkonstin on generating Mandalas in R](https://fronkonstin.com/2018/02/14/mandalas/).

[Click here to view the sketch](sketch.html).
