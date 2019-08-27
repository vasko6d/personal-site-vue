<!DOCTYPE html>
<html>
<head>
  <title> 2D Sierpinski Gasket  </title>
  <script id="vertex-shader" type="x-shader/x-vertex">
	attribute vec4 vPosition;
	uniform mat4 modelViewMatrix; 

	void main()
	{
		gl_PointSize = 1.0;
		gl_Position = modelViewMatrix * vPosition;
	}

  </script>
  <script id="fragment-shader" type="x-shader/x-fragment">
	precision mediump float;

	uniform vec4 Colors;
	void main()
	{
		gl_FragColor = Colors;
	}
  </script>

	<script src="../Common/webgl-utils.js" type="text/javascript"></script>
	<script src="../Common/initShaders.js" type="text/javascript"></script>
	<script src="../Common/MV.js" type="text/javascript"></script>
	<script>
///////////////////////////////////////////////////////////////
/// David Vasko 10-17-2014
/// CS174A
/////////////////////////////////////////////////////////////

// The second fractal chosen was the Golden Rectangle Fractle

var gl;

var points; //variable that holds the vertexes for the sierginski gasket
var vertices2; // variable that holds the vertexes for the Golden Rectangle
var modelViewMatrix;
var ctm = mat4(); // the matrix we will use for rotation
var beginRotation = false; //set up a bool to toggle whether we are rotating or not

var NumPoints = 5000; //how many points are in the gasket

var cIndex = 0; //index to decide which color is used by the fragment shader

var colors = [
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // magenta
  vec4(0.0, 1.0, 1.0, 1.0) // cyan
];

var inGasket = false; // a bool to toggle whether the gasket or golden rectangle is shown

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  ////////////////////////////////////////////////////////////////////
  //
  //  Initialize our data for the Sierpinski Gasket
  //

  // First, initialize the corners of our gasket with three points.

  var vertices = [vec2(-0.5, -0.5), vec2(0, 0.5), vec2(0.5, -0.5)];

  // Specify a starting point p for our iterations
  // p must lie inside any set of three vertices

  var u = add(vertices[0], vertices[1]);
  var v = add(vertices[0], vertices[2]);
  var p = scale(0.25, add(u, v));

  // And, add our initial point into our array of points

  points = [p];

  // Compute new points
  // Each new point is located midway between
  // last point and a randomly chosen vertex

  for (var i = 0; points.length < NumPoints; ++i) {
    var j = Math.floor(Math.random() * 3);
    p = add(points[i], vertices[j]);
    p = scale(0.5, p);
    points.push(p);
  }
  ////////////////////////////////////////////////////////////////////
  //
  //Initialize Data for Golden Rectagle Fractal
  //
  /*
I start with a rectangle defined with the following vertices
	c______________d
	|              |
	|              |
	|              |
	|______________|
    b              a

Now i want to decide where the line EF should go. Becuase the line EF will create a square
with all sides equal to the length of CD, we simply take the vector differece between C and D
,rotate that vector by -90 decrees and add that result to B to create E, and add that result
to C to create F

	c_________f____d
	|         |    |
	|         |    |
	|         |    |
	|_________|____|
    b         e    a

Now i redefine the rectangel DAEF as the new ABCD and contiuously repeat the process.

*/

  //First initialize the four line segmets that make up the first rectagle

  vertices2 = [
    vec2(-0.809, 0.5),
    vec2(0.809, 0.5),

    vec2(0.809, 0.5),
    vec2(0.809, -0.5),

    vec2(0.809, -0.5),
    vec2(-0.809, -0.5),

    vec2(-0.809, -0.5),
    vec2(-0.809, 0.5)
  ];

  //establish a variable to remember what the four vertices of teh current rectangle is
  var currentRect = [
    vec2(0.809, -0.5), //a
    vec2(-0.809, -0.5), //b
    vec2(-0.809, 0.5), //c
    vec2(0.809, 0.5) //d
  ];

  for (var i = 0; i < 12; ++i) {
    var neg = 1; //this is needed to simulate a -90deg rotatio without using a matrix

    //tempRect is built based on currentRect and replaces currentRect once it is finished
    var tempRect = [
      currentRect[3], //newa
      currentRect[0] //newb
    ];

    if (i % 2 != 0) {
      neg = -1;
    } //ever othey rectangle needs a negative to correctly rotate

    var distBC = subtract(currentRect[2], currentRect[1]);
    distBC = vec2(distBC[1] * neg, distBC[0] * neg); // this step swaps x and y which along with the variable neg
    // simulates a rotation of -90 degrees
    var tempVert = add(currentRect[1], distBC);
    vertices2.push(tempVert); //add each new vertex pair to vertices 2 to add the new line segment
    tempRect.push(tempVert); //newc
    tempVert = add(currentRect[2], distBC);
    vertices2.push(tempVert);
    tempRect.push(tempVert); //newd

    //		document.getElementById("testing").innerHTML = currentRect + "|--|" + tempRect;
    currentRect = tempRect;
  }

  /////////////////////////////////////////////////////////////////

  //
  //  Configure WebGL
  //
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //  Load shaders and initialize attribute buffers

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

  //Let a boolean control whether the gasket or golden rectangel is buffered
  if (inGasket) {
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  } else {
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW);
  }

  // Associate out shader variables with our data buffer

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  //Set up a onkeydown event that will index the color index and send it to the GPU
  //Or it will change the current fractal, or it will begin of stop rotation

  window.onkeydown = function(e) {
    var kc = e.keyCode.toString();
    if (kc == 32) {
      ++cIndex;
      if (cIndex == 7) {
        cIndex += -7;
      }
      var ColorsLoc = gl.getUniformLocation(program, "Colors");
      gl.uniform4f(
        ColorsLoc,
        colors[cIndex][0],
        colors[cIndex][1],
        colors[cIndex][2],
        colors[cIndex][3]
      );

      //document.getElementById("testing").innerHTML = "keycode is: " + kc + " || cIndex is: " + cIndex;
      //the above line was used for testing
    } else if (kc == 37 || kc == 39) {
      inGasket = !inGasket;

      if (inGasket) {
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
      } else {
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW);
      }
    } else if (kc == 82) {
      beginRotation = true;
    } else if (kc == 84) {
      beginRotation = false;
    }
  };
  //r is 82
  //t is 84
  //" " is 32
  //<- is 37
  //-> is 39

  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (beginRotation) {
    ctm = mult(ctm, rotate(1, [0, 0, 1]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    //document.getElementById("testing").innerHTML = ctm;
  }
  if (inGasket) {
    gl.drawArrays(gl.POINTS, 0, points.length);
  } else {
    gl.drawArrays(gl.LINES, 0, vertices2.length);
  }
  window.requestAnimFrame(render);
}
</script>
</head>

<center>
	<h1>David Vasko - Homework 1: Basic Transformations</h1>
</center>

<body>
	
	<center>
	<canvas id="gl-canvas" height="512" width="512">
        Oops ... your browser doesn't support the HTML5 canvas element
	</canvas>
	<br></br>
	<p> Press SPACE BAR to change the color! </p>
	<p> Press LEFT or RIGHT to change the fractal! </p>
	<p> Press "r" to begin rotation. Press "t" to stop rotation. </p>
	<p id="testing"> </p>
	</center>
</body>
</html>

