<template>
  <div id="fractals">
    <script id="vertex-shader" type="x-shader/x-vertex">
      attribute vec4 vPos;
      uniform mat4 mvm;
      void main()
      {
        gl_PointSize = 1.0;
        gl_Position = mvm * vPos;
      }
    </script>
    <script id="fragment-shader" type="x-shader/x-fragment">
      precision mediump float;
      uniform vec4 Color;
      void main()
      {
      	gl_FragColor = Color;
      }
    </script>
    <div>
      <canvas id="gl-canvas" width="650px" height="650px"
        >Oops ... your browser doesn't support the HTML5 canvas element</canvas
      >
    </div>
    <div class="blk-container">
      <action-controls :actionCtrls="actionCtrls" />
    </div>
  </div>
</template>
<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
import WebGLUtils from "@/mixins/webgl/WebGLUtils.vue";
import ActionControls from "@/components/webgl/ActionControls.vue";
//var Timer = require("../mixins/webgl/Timer.js");

// Mixin Aliases
var mv = MatrixMath.methods;
var wglu = WebGLUtils.methods;

export default {
  name: "Fractals",
  components: {
    ActionControls
  },
  data() {
    return {
      // Web Gl Variables
      gl: "",
      program: "",
      loc: {
        color: "",
        mvm: "",
        vPos: ""
      },
      val: {
        color: [
          mv.vec4(1.0, 1.0, 1.0, 1.0), // white
          mv.vec4(1.0, 0.0, 0.0, 1.0), // red
          mv.vec4(1.0, 1.0, 0.0, 1.0), // yellow
          mv.vec4(0.0, 1.0, 0.0, 1.0), // green
          mv.vec4(0.0, 0.0, 1.0, 1.0), // blue
          mv.vec4(1.0, 0.0, 1.0, 1.0), // magenta
          mv.vec4(0.0, 1.0, 1.0, 1.0) // cyan
        ],
        mvm: mv.mat4(),
        vPos: ""
      },
      buf: {
        points: ""
      },

      // Data Variables
      gasketPoints: this.generateSierpenskiGasket(5000),
      goldenRectPoints: this.generateGoldenRectangle(12),

      // Other Display Variables
      vav: {
        inGasket: true,
        beginRotation: false,
        cIndex: 6 //index to decide which color is used by the fragment shader
      },

      // Keybind Variables
      actionCtrls: {
        changeColor: {
          keybind: "c",
          icon: "fas fa-palette",
          desc: "Change Color",
          holdable: false,
          updateFlag: false,
          framesActive: 0,
          updateFxn: function(vav) {
            vav.cIndex = (vav.cIndex + 1) % 7;
          }
        },
        changeFractal: {
          keybind: "n",
          icon: "fas fa-step-forward",
          desc: "Change Fractal",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function(vav) {
            vav.inGasket = !vav.inGasket;
          }
        },
        toggleRotation: {
          keybind: "r",
          icon: "fas fa-sync-alt",
          desc: "Start/Stop Rotation",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function(vav) {
            vav.beginRotation = !vav.beginRotation;
          }
        }
      },
      invActionCtrls: ""
    };
  },

  mounted() {
    this.configureWebGL();
    this.invActionCtrls = wglu.getInvertedControlObject(this.actionCtrls);
    window.addEventListener("keydown", e => {
      let ch = String.fromCharCode(e.keyCode).toLowerCase();
      if (ch in this.invActionCtrls) {
        this.actionCtrls[this.invActionCtrls[ch][0]].updateFlag = true;
      }
    });
    window.addEventListener("keyup", e => {
      let ch = String.fromCharCode(e.keyCode).toLowerCase();
      if (ch in this.invActionCtrls) {
        this.actionCtrls[this.invActionCtrls[ch][0]].updateFlag = false;
      }
    });
    this.render();
  },

  beforeDestroy() {
    this.render = () => {};
  },

  methods: {
    generateSierpenskiGasket(numGasketPoints) {
      var vertices = [mv.vec2(-0.5, -0.5), mv.vec2(0, 0.5), mv.vec2(0.5, -0.5)]; // three corner points of gasket
      var u = mv.add(vertices[0], vertices[1]); // basis vector 1
      var v = mv.add(vertices[0], vertices[2]); // basis vector 2

      // Create the set of points for the gasket by taking the midpoint of the last
      // point and a randomly chosen vertex
      var gasketPoints = [];
      gasketPoints.push(mv.scale(0.25, mv.add(u, v)));
      for (let i = 0; gasketPoints.length <= numGasketPoints; ++i) {
        let j = Math.floor(Math.random() * 3);
        let p = mv.add(gasketPoints[i], vertices[j]);
        p = mv.scale(0.5, p);
        gasketPoints.push(p);
      }
      return gasketPoints;
    },

    generateGoldenRectangle(numRects) {
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
      var golderRectPoints = [
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

      for (let i = 0; i < numRects; ++i) {
        let neg = i % 2 == 0 ? 1 : -1; //this is to simulate a -90deg rotatio without using a matrix

        var tempRect = [
          currentRect[3], //newa
          currentRect[0] //newb
        ];

        var distBC = mv.subtract(currentRect[2], currentRect[1]);
        distBC = mv.vec2(distBC[1] * neg, distBC[0] * neg); // this step swaps x and y which along with the variable neg simulates a rotation of -90 degrees

        var tempVert = mv.add(currentRect[1], distBC);
        golderRectPoints.push(tempVert); //mv.add each new vertex pair to vertices 2 to mv.add the new line segment
        tempRect.push(tempVert); //newc

        tempVert = mv.add(currentRect[2], distBC);
        golderRectPoints.push(tempVert);
        tempRect.push(tempVert); //newd

        currentRect = tempRect;
      }

      return golderRectPoints;
    },

    setBufferData() {
      // Set Color Data
      this.gl.uniform4f(
        this.loc.color,
        this.val.color[this.vav.cIndex][0],
        this.val.color[this.vav.cIndex][1],
        this.val.color[this.vav.cIndex][2],
        this.val.color[this.vav.cIndex][3]
      );
      // Set Vertices
      if (this.vav.inGasket) {
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

    configureWebGL() {
      [this.gl, this.program] = wglu.baseWebGL(
        "gl-canvas",
        "vertex-shader",
        "fragment-shader"
      );

      // Set Up Buffers
      this.buf.points = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buf.points);

      // Set up Shader Variables
      this.loc.vPos = this.gl.getAttribLocation(this.program, "vPos");
      this.gl.vertexAttribPointer(this.loc.vPos, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.loc.vPos);

      // Set up Uniform Locations
      this.loc.color = this.gl.getUniformLocation(this.program, "Color");
      this.loc.mvm = this.gl.getUniformLocation(this.program, "mvm");
      this.gl.uniformMatrix4fv(this.loc.mvm, false, mv.flatten(this.val.mvm));
    },

    render() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      wglu.executeActions(this.actionCtrls, this.vav);
      this.setBufferData();

      if (this.vav.beginRotation) {
        this.val.mvm = mv.mult(this.val.mvm, mv.rotationMatrix(1, [0, 0, 1]));
        this.gl.uniformMatrix4fv(this.loc.mvm, false, mv.flatten(this.val.mvm));
      }
      if (this.vav.inGasket) {
        this.gl.drawArrays(this.gl.POINTS, 0, this.gasketPoints.length);
      } else {
        this.gl.drawArrays(this.gl.LINES, 0, this.goldenRectPoints.length);
      }
      wglu.requestAnimFrame()(this.render);
    }
  }
};
</script>
