<template>
  <div id="fractals">
    <div>
      <canvas id="gl-canvas" width="650px" height="650px">Oops ... your browser doesn't support the HTML5 canvas element</canvas>
    </div>
    <div class="blk-container">
      <ActionControls :actionCtrls="actionCtrls" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from "vue";
import * as mv from "@/utils/webgl/MatrixMath";
import type { Vec } from "@/utils/webgl/MatrixMath";
import * as wglu from "@/utils/webgl/WebGLUtils";
import ActionControls from "@/components/webgl/ActionControls.vue";
import type { ActionCtrlMap } from "@/utils/webgl/types";

const vertexShaderSrc = `
  attribute vec4 vPos;
  uniform mat4 mvm;
  void main()
  {
    gl_PointSize = 1.0;
    gl_Position = mvm * vPos;
  }
`;
const fragmentShaderSrc = `
  precision mediump float;
  uniform vec4 Color;
  void main()
  {
    gl_FragColor = Color;
  }
`;

interface Vav {
  inGasket: boolean;
  beginRotation: boolean;
  cIndex: number;
}

// Web Gl Variables (not template-bound, kept as plain non-reactive state)
let gl: WebGLRenderingContext;
let program: WebGLProgram;
const loc: { color: WebGLUniformLocation | null; mvm: WebGLUniformLocation | null; vPos: number } = {
  color: null,
  mvm: null,
  vPos: 0,
};
const val: { color: Vec[]; mvm: ReturnType<typeof mv.mat4> } = {
  color: [
    mv.vec4(1.0, 1.0, 1.0, 1.0), // white
    mv.vec4(1.0, 0.0, 0.0, 1.0), // red
    mv.vec4(1.0, 1.0, 0.0, 1.0), // yellow
    mv.vec4(0.0, 1.0, 0.0, 1.0), // green
    mv.vec4(0.0, 0.0, 1.0, 1.0), // blue
    mv.vec4(1.0, 0.0, 1.0, 1.0), // magenta
    mv.vec4(0.0, 1.0, 1.0, 1.0), // cyan
  ],
  mvm: mv.mat4(),
};
const buf: { points: WebGLBuffer | null } = { points: null };

// Data Variables
let gasketPoints: Vec[] = [];
let goldenRectPoints: Vec[] = [];

// Other Display Variables
const vav: Vav = {
  inGasket: true,
  beginRotation: false,
  cIndex: 6, // index to decide which color is used by the fragment shader
};

// Keybind Variables
const actionCtrls = reactive<ActionCtrlMap<Vav>>({
  changeColor: {
    keybind: "c",
    icon: "fas fa-palette",
    desc: "Change Color",
    holdable: false,
    updateFlag: false,
    framesActive: 0,
    updateFxn: function (vav) {
      vav.cIndex = (vav.cIndex + 1) % 7;
    },
  },
  changeFractal: {
    keybind: "n",
    icon: "fas fa-step-forward",
    desc: "Change Fractal",
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (vav) {
      vav.inGasket = !vav.inGasket;
    },
  },
  toggleRotation: {
    keybind: "r",
    icon: "fas fa-sync-alt",
    desc: "Start/Stop Rotation",
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (vav) {
      vav.beginRotation = !vav.beginRotation;
    },
  },
});
let invActionCtrls: ReturnType<typeof wglu.getInvertedControlObject> = {};

function generateSierpenskiGasket(numGasketPoints: number): Vec[] {
  const vertices = [mv.vec2(-0.5, -0.5), mv.vec2(0, 0.5), mv.vec2(0.5, -0.5)]; // three corner points of gasket
  const u = mv.add(vertices[0]!, vertices[1]!) as Vec; // basis vector 1
  const v = mv.add(vertices[0]!, vertices[2]!) as Vec; // basis vector 2

  // Create the set of points for the gasket by taking the midpoint of the last
  // point and a randomly chosen vertex
  const points: Vec[] = [];
  points.push(mv.scale(0.25, mv.add(u, v) as Vec) as Vec);
  for (let i = 0; points.length <= numGasketPoints; ++i) {
    const j = Math.floor(Math.random() * 3);
    let p = mv.add(points[i]!, vertices[j]!) as Vec;
    p = mv.scale(0.5, p) as Vec;
    points.push(p);
  }
  return points;
}

function generateGoldenRectangle(numRects: number): Vec[] {
  /* Start with a rectangle defined with the following vertices
    c______________d
    |              |
    |              |
    |              |
    |______________|
    b              a
  Now decide where the line EF should go. Becuase the line EF will create a square
  with all sides equal to the length of CD, we simply take the vector differece between C and D
  ,rotate that vector by -90 decrees and mv.add that result to B to create E, and mv.add that result
  to C to create F
    c_________f____d
    |         |    |
    |         |    |
    |         |    |
    |_________|____|
    b         e    a
  Now redefine the rectangel DAEF as the new ABCD and contiuously repeat the process.
  */

  // The four line segmets that make up the first rectagle
  const golderRectPoints: Vec[] = [
    mv.vec2(-0.809, 0.5),
    mv.vec2(0.809, 0.5),

    mv.vec2(0.809, 0.5),
    mv.vec2(0.809, -0.5),

    mv.vec2(0.809, -0.5),
    mv.vec2(-0.809, -0.5),

    mv.vec2(-0.809, -0.5),
    mv.vec2(-0.809, 0.5),
  ];

  let currentRect: Vec[] = [
    mv.vec2(0.809, -0.5), // a
    mv.vec2(-0.809, -0.5), // b
    mv.vec2(-0.809, 0.5), // c
    mv.vec2(0.809, 0.5), // d
  ];

  for (let i = 0; i < numRects; ++i) {
    const neg = i % 2 == 0 ? 1 : -1; // this is to simulate a -90deg rotatio without using a matrix

    const tempRect: Vec[] = [
      currentRect[3]!, // newa
      currentRect[0]!, // newb
    ];

    let distBC = mv.subtract(currentRect[2]!, currentRect[1]!) as Vec;
    distBC = mv.vec2(distBC[1]! * neg, distBC[0]! * neg); // this step swaps x and y which along with the variable neg simulates a rotation of -90 degrees

    let tempVert = mv.add(currentRect[1]!, distBC) as Vec;
    golderRectPoints.push(tempVert); // mv.add each new vertex pair to vertices 2 to mv.add the new line segment
    tempRect.push(tempVert); // newc

    tempVert = mv.add(currentRect[2]!, distBC) as Vec;
    golderRectPoints.push(tempVert);
    tempRect.push(tempVert); // newd

    currentRect = tempRect;
  }

  return golderRectPoints;
}

function setBufferData() {
  // Set Color Data
  const c = val.color[vav.cIndex]!;
  gl.uniform4f(loc.color, c[0]!, c[1]!, c[2]!, c[3]!);
  // Set Vertices
  if (vav.inGasket) {
    gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(gasketPoints as unknown as Vec), gl.STATIC_DRAW);
  } else {
    gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(goldenRectPoints as unknown as Vec), gl.STATIC_DRAW);
  }
}

function configureWebGL() {
  [gl, program] = wglu.baseWebGL("gl-canvas", "vertex-shader", "fragment-shader");

  // Set Up Buffers
  buf.points = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf.points);

  // Set up Shader Variables
  loc.vPos = gl.getAttribLocation(program, "vPos");
  gl.vertexAttribPointer(loc.vPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(loc.vPos);

  // Set up Uniform Locations
  loc.color = gl.getUniformLocation(program, "Color");
  loc.mvm = gl.getUniformLocation(program, "mvm");
  gl.uniformMatrix4fv(loc.mvm, false, mv.flatten(val.mvm));
}

let render: () => void = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  wglu.executeActions(actionCtrls, vav);
  setBufferData();

  if (vav.beginRotation) {
    val.mvm = mv.mult(val.mvm, mv.rotationMatrix(1, [0, 0, 1])) as ReturnType<typeof mv.mat4>;
    gl.uniformMatrix4fv(loc.mvm, false, mv.flatten(val.mvm));
  }
  if (vav.inGasket) {
    gl.drawArrays(gl.POINTS, 0, gasketPoints.length);
  } else {
    gl.drawArrays(gl.LINES, 0, goldenRectPoints.length);
  }
  wglu.requestAnimFrame()(render);
};

onMounted(() => {
  gasketPoints = generateSierpenskiGasket(5000);
  goldenRectPoints = generateGoldenRectangle(12);

  wglu.injectShaderScript("vertex-shader", "x-shader/x-vertex", vertexShaderSrc);
  wglu.injectShaderScript("fragment-shader", "x-shader/x-fragment", fragmentShaderSrc);
  configureWebGL();
  invActionCtrls = wglu.getInvertedControlObject(actionCtrls);
  window.addEventListener("keydown", (e) => {
    const ch = String.fromCharCode(e.keyCode).toLowerCase();
    if (ch in invActionCtrls) {
      actionCtrls[invActionCtrls[ch]![0]!]!.updateFlag = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    const ch = String.fromCharCode(e.keyCode).toLowerCase();
    if (ch in invActionCtrls) {
      actionCtrls[invActionCtrls[ch]![0]!]!.updateFlag = false;
    }
  });
  render();
});

onUnmounted(() => {
  render = () => {};
  wglu.removeShaderScript("vertex-shader");
  wglu.removeShaderScript("fragment-shader");
});
</script>
