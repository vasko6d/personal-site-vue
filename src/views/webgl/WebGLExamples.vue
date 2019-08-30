<template>
  <div id="webgl-examples">
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
    <div class="blk-container">
      <h2>Graphics using WebGL</h2>
      <div class="navigation">
        <a ref="webgl-a" href="#/" @click="isOpen = !isOpen">
          <h3 ref="webgl-h3">
            {{ examples[exIdx].name }}
            <i ref="webgl-i" class="fa fa-angle-down"></i>
          </h3>
        </a>
        <div
          :class="{ isOpen }"
          class="dropdown"
          v-closable="{
            excludeList: ['webgl-a', 'webgl-h3', 'webgl-i'],
            handler: 'onClose'
          }"
        >
          <ul>
            <li
              v-for="(example, index) in examples"
              :key="example.index"
              @click="(exIdx = index), onClose()"
            >
              {{ example.name }}
            </li>
          </ul>
        </div>
      </div>
      <canvas id="gl-canvas" width="650px" height="650px"
        >Oops ... your browser doesn't support the HTML5 canvas element</canvas
      >
      <h3>Instructions</h3>
      <ul>
        <li v-on:click="keyPressHandler('c')">"c" - Change Color</li>
        <li v-on:click="keyPressHandler('n')">"n" - Change Fractal</li>
        <li v-on:click="keyPressHandler('r')">"r" - Toggle Rotation</li>
      </ul>
    </div>
  </div>
</template>

<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
import ShaderUtils from "@/mixins/webgl/ShaderUtils.vue";
import WebGLUtils from "@/mixins/webgl/WebGLUtils.vue";
import Fractals from "./Fractals.vue";
//var Timer = require("../mixins/webgl/Timer.js");

// Mixin Aliases
var mv = MatrixMath.methods;
var su = ShaderUtils.methods;
var wglu = WebGLUtils.methods;

export default {
  name: "WebGLExamples",
  data() {
    return {
      // webgl data
      gl: "",
      program: "",
      modelViewMatrix: "",
      colorsUniform: "",
      ctm: mv.mat4(),
      exIdx: 0,
      examples: [
        { name: "Fractals on Canvas", initialized: false, data: Fractals.data },
        { name: "Cubes in Space", initialized: false },
        { name: "FFVII Textures", initialized: false },
        { name: "Creating the Galaxy", initialized: false }
      ],
      // dropdown data
      isOpen: false,
      // example specific data
      inGasket: true,
      beginRotation: false,
      cIndex: 3, //index to decide which color is used by the fragment shader
      colors: [
        mv.vec4(1.0, 1.0, 1.0, 1.0), // white
        mv.vec4(1.0, 0.0, 0.0, 1.0), // red
        mv.vec4(1.0, 1.0, 0.0, 1.0), // yellow
        mv.vec4(0.0, 1.0, 0.0, 1.0), // green
        mv.vec4(0.0, 0.0, 1.0, 1.0), // blue
        mv.vec4(1.0, 0.0, 1.0, 1.0), // magenta
        mv.vec4(0.0, 1.0, 1.0, 1.0) // cyan
      ],
      numPoints: 5000, //how many this.gasketPoints are in the gasket
      gasketPoints: [], //variable that holds the vertexes for the sierginski gasket
      goldenRectPoints: [] // variable that holds the vertexes for the Golden Rectangle
    };
  },
  mounted() {
    this.initSierpenskiGasket();
    this.initGoldenRectangle();
    this.configureWebGL();
    window.addEventListener("keypress", e => {
      this.keyPressHandler(String.fromCharCode(e.keyCode));
    });
    this.render();
  },
  beforeDestroy() {
    this.render = () => {};
  },
  methods: {
    onClose() {
      this.isOpen = false;
    },
    initSierpenskiGasket() {
      var vertices = [mv.vec2(-0.5, -0.5), mv.vec2(0, 0.5), mv.vec2(0.5, -0.5)]; // three corner points of gasket
      var u = mv.add(vertices[0], vertices[1]); // basis vector 1
      var v = mv.add(vertices[0], vertices[2]); // basis vector 2

      // Create the set of points for the gasket by taking the midpoint of the last
      // point and a randomly chosen vertex
      this.gasketPoints.push(mv.scale(0.25, mv.add(u, v)));
      for (let i = 0; this.gasketPoints.length <= this.numPoints; ++i) {
        let j = Math.floor(Math.random() * 3);
        let p = mv.add(this.gasketPoints[i], vertices[j]);
        p = mv.scale(0.5, p);
        this.gasketPoints.push(p);
      }
    },

    initGoldenRectangle() {
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
      this.goldenRectPoints = [
        mv.vec2(-0.809, 0.5),
        mv.vec2(0.809, 0.5),

        mv.vec2(0.809, 0.5),
        mv.vec2(0.809, -0.5),

        mv.vec2(0.809, -0.5),
        mv.vec2(-0.809, -0.5),

        mv.vec2(-0.809, -0.5),
        mv.vec2(-0.809, 0.5)
      ];

      var currentRect = [
        mv.vec2(0.809, -0.5), //a
        mv.vec2(-0.809, -0.5), //b
        mv.vec2(-0.809, 0.5), //c
        mv.vec2(0.809, 0.5) //d
      ];

      for (let i = 0; i < 12; ++i) {
        let neg = i % 2 == 0 ? 1 : -1; //this is to simulate a -90deg rotatio without using a matrix

        var tempRect = [
          currentRect[3], //newa
          currentRect[0] //newb
        ];

        var distBC = mv.subtract(currentRect[2], currentRect[1]);
        distBC = mv.vec2(distBC[1] * neg, distBC[0] * neg); // this step swaps x and y which along with the variable neg simulates a rotation of -90 degrees

        var tempVert = mv.add(currentRect[1], distBC);
        this.goldenRectPoints.push(tempVert); //mv.add each new vertex pair to vertices 2 to mv.add the new line segment
        tempRect.push(tempVert); //newc

        tempVert = mv.add(currentRect[2], distBC);
        this.goldenRectPoints.push(tempVert);
        tempRect.push(tempVert); //newd

        currentRect = tempRect;
      }
    },

    configureWebGL() {
      var canvas = document.getElementById("gl-canvas");
      this.gl = wglu.setupWebGL(canvas);
      if (!this.gl) {
        alert("WebGL isn't available");
      }

      this.gl.viewport(0, 0, canvas.width, canvas.height);
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

      //  Load shaders and initialize attribute buffers
      this.program = su.init(this.gl, "vertex-shader", "fragment-shader");
      this.gl.useProgram(this.program);

      // Load the data into the GPU
      var bufferId = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferId);

      // Load the initial data
      //this.setBufferData();
      //this.keyPressHandler("c");

      // Associate out shader variables with our data buffer
      var vPosition = this.gl.getAttribLocation(this.program, "vPosition");
      this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(vPosition);

      this.modelViewMatrix = this.gl.getUniformLocation(
        this.program,
        "modelViewMatrix"
      );
      this.gl.uniformMatrix4fv(
        this.modelViewMatrix,
        false,
        mv.flatten(this.ctm)
      );

      // Resize if the screen sice wont fit default canvas size
      this.resize(this.gl);
    },

    setBufferData() {
      // Set Color Data
      this.colorsUniform = this.gl.getUniformLocation(this.program, "Colors");
      this.gl.uniform4f(
        this.colorsUniform,
        this.colors[this.cIndex][0],
        this.colors[this.cIndex][1],
        this.colors[this.cIndex][2],
        this.colors[this.cIndex][3]
      );
      // Set Vertices
      if (this.inGasket) {
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          mv.flatten(this.gasketPoints),
          this.gl.STATIC_DRAW
        );
      } else {
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          mv.flatten(this.goldenRectPoints),
          this.gl.STATIC_DRAW
        );
      }
    },

    keyPressHandler(e) {
      if (e === "c") {
        ++this.cIndex;
        if (this.cIndex == 7) {
          this.cIndex += -7;
        }
      } else if (e === "n") {
        this.inGasket = !this.inGasket;
      } else if (e === "r") {
        this.beginRotation = !this.beginRotation;
      }
    },

    resize(gl) {
      // Lookup the size the browser is displaying the canvas.
      var displayWidth = screen.width;
      var displayHeight = screen.height;

      // Check if the canvas is not the same size.
      if (gl.canvas.width > displayWidth || gl.canvas.height > displayHeight) {
        // Make the canvas the same size
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayWidth;
        gl.viewport(0, 0, displayWidth, displayWidth);
      }
    },

    render() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.setBufferData();

      if (this.beginRotation) {
        this.ctm = mv.mult(this.ctm, mv.rotationMatrix(1, [0, 0, 1]));
        this.gl.uniformMatrix4fv(
          this.modelViewMatrix,
          false,
          mv.flatten(this.ctm)
        );
      }
      if (this.inGasket) {
        this.gl.drawArrays(this.gl.POINTS, 0, this.gasketPoints.length);
      } else {
        this.gl.drawArrays(this.gl.LINES, 0, this.goldenRectPoints.length);
      }
      wglu.requestAnimFrame()(this.render);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";
#webgl-examples {
  .blk-container {
    width: 100%;
    max-width: 650px;
    h2 {
      margin-bottom: 1em;
    }
    ul {
      list-style-type: none;
      text-align: left;
      margin-left: 0px;
      li {
        text-align: center;
        margin: 0.25em;
        color: darken($nav-txt, 15%);
        border-radius: 0.35em;
        background-color: rgba($nav-bg, 0.3);
        width: 100%;
        height: 100%;
        &:hover {
          color: $nav-txt;
          background-color: rgba($nav-bg, 0.6);
        }
      }
    }
    .navigation {
      position: relative;
      a {
        h3 {
          margin-top: 0px;
          margin-bottom: 0px;
        }
        color: darken($nav-txt, 15%);
        background-color: rgba($nav-bg, 0.3);
        &:hover {
          color: $nav-txt;
          background-color: rgba($nav-bg, 0.6);
        }
        display: inline-block;
      }
    }
  }
}
</style>
