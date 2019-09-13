<template>
  <div id="cubert">
    <script id="vertex-shader" type="x-shader/x-vertex">
      attribute  vec3 vPos;
      uniform mat4 mMat;
      uniform mat4 vMat;
      uniform mat4 pMat;
      void main()
      {
          gl_Position = pMat * vMat * mMat * vec4(vPos, 1);
      }
    </script>
    <script id="fragment-shader" type="x-shader/x-fragment">
      precision mediump float;
      uniform vec4 color;
      void main()
      {
          gl_FragColor = color;
      }
    </script>
    <canvas id="gl-canvas" width="650px" height="650px"
      >Oops ... your browser doesn't support the HTML5 canvas element</canvas
    >
    <webgl-camera :camera="av.camera" :ctrls="cameraCtrls" />
    <action-controls :actionCtrls="actionCtrls" />
  </div>
</template>
<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
import WebGLUtils from "@/mixins/webgl/WebGLUtils.vue";
import WebglCamera from "@/components/webgl/WebglCamera.vue";
import ActionControls from "@/components/webgl/ActionControls.vue";
//var Timer = require("../mixins/webgl/Timer.js");

// Mixin Aliases
var mv = MatrixMath.methods;
var wglu = WebGLUtils.methods;
var wglc = WebglCamera.methods;

export default {
  name: "Cubert",
  components: {
    WebglCamera,
    ActionControls
  },
  data() {
    return {
      // Web Gl Variables
      gl: "", // [g]raphics [l]ibrary
      p: "", // Shader [p]rogram

      // Location to the variables used in the shader programs
      loc: {
        // Uniforms
        u: {
          pMat: "", // projection matrix
          vMat: "", // view matrix
          mMat: "", // model matrix
          color: "" // RGBA color for the shape
        },
        // Attributes
        a: {
          pos: "" // Position
        }
      },

      // Buffer Data
      buf: {
        pos: ""
      },
      dat: {
        pos: []
      },
      bufIdx: {
        lastEnd: 0,
        cube: "",
        circle: "",
        plus: ""
      },

      // Data Variables
      cubes: [
        this.cube([10, -10, -10], function(time) {
          return 1 + 0.1 * Math.sin(time / 2);
        }),
        this.cube([10, -10, 10], function(time) {
          return 1 + 0.03 * Math.sin(time + 1 / 1.17);
        }),

        this.cube(
          [10, 10, -10],
          function() {
            return 1;
          },
          function(time) {
            return mv.deg(time) / 2;
          },
          [1, 0, 0]
        ),

        this.cube(
          [10, 10, 10],
          function() {
            return 1;
          },
          function(time) {
            return mv.deg(time);
          },
          [0, 1, 0]
        ),

        this.cube(
          [-10, -10, -10],
          function() {
            return 1;
          },
          function(time) {
            return mv.deg(time) / 4;
          },
          [0, 0, 1]
        ),

        this.cube(
          [-10, -10, 10],
          function() {
            return 1;
          },
          function(time) {
            return mv.deg(time);
          },
          [1, 1, 1]
        ),

        this.cube([-10, 10, -10], function(time) {
          return 1 + 0.1 * Math.sin(time + 6 / 1.17);
        }),
        this.cube([-10, 10, 10], function(time) {
          return 1 + 0.1 * Math.sin(time * 2 + 7 / 1.17);
        }),
        this.cube([0, -11.4, 0], function() {
          return [1000, 0.1, 1000];
        })
      ],
      color: [
        mv.vec4(0.3, 0.3, 0.3, 1.0), // grey
        mv.vec4(1.0, 0.0, 0.0, 1.0), // red
        mv.vec4(1.0, 1.0, 0.0, 1.0), // yellow
        mv.vec4(0.0, 1.0, 0.0, 1.0), // green
        mv.vec4(0.0, 0.0, 1.0, 1.0), // blue
        mv.vec4(1.0, 0.0, 1.0, 1.0), // magenta
        mv.vec4(0.0, 1.0, 1.0, 1.0), // cyan
        mv.vec4(1.0, 1.0, 1.0, 1.0), // white
        mv.vec4(0.803, 0.592, 0.278) // brown
      ],
      crosshair: {
        near: -15,
        far: 15,
        left: -15.0,
        right: 15.0,
        top: 15.0,
        bottom: -15.0
      },

      // [A]ction affected [V]ariables
      av: {
        dt: 0.0,
        cIndex: 0,
        showCrosshair: false,
        camera: wglc.initCamera({
          position: mv.vec3(-30, 0, 0)
        })
      },

      // Camera Keybind variables
      cameraCtrls: wglc.defaultControls(),
      invCameraCtrls: "", // initialize during mount

      // Other Keybind Variables
      actionCtrls: {
        changeColor: {
          keybind: "c",
          icon: "fas fa-palette",
          desc: "Change Color of Cubes",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function(av) {
            av.cIndex = (av.cIndex + 1) % 8;
          }
        },
        toggleChrosshair: {
          keybind: "x",
          icon: "fas fa-crosshairs",
          desc: "Toggle Crosshair On/Off",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function(av) {
            av.showCrosshair = !av.showCrosshair;
          }
        },
        revert: {
          keybind: "z",
          icon: "fas fa-undo",
          desc: "Revert to Original State",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function(av) {
            av.camera = wglc.initCamera(av.camera.initialProps);
            av.dt = 0.0;
            av.cIndex = 0;
            av.showCrosshair = false;
          }
        }
      },
      invActionCtrls: "" // initialize during mount
    };
  },

  mounted() {
    // Generate Vetex Dat and set up web gl
    this.generateCubeVertices();
    this.generateCrosshairVertices(0.1);
    this.configureWebGL();

    // Set up the inverted controls adn window events
    this.invCameraCtrls = {
      ...wglu.getInvertedControlObject(this.cameraCtrls.move, "move"),
      ...wglu.getInvertedControlObject(this.cameraCtrls.look, "look")
    };
    this.invActionCtrls = wglu.getInvertedControlObject(this.actionCtrls);
    window.addEventListener("keydown", e => {
      let ch = String.fromCharCode(e.keyCode).toLowerCase();
      if (ch in this.invActionCtrls) {
        this.actionCtrls[this.invActionCtrls[ch][0]].updateFlag = true;
      }
      if (ch in this.invCameraCtrls) {
        let invCC = this.invCameraCtrls[ch];
        this.cameraCtrls[invCC[0]][invCC[1]].updateFlag = true;
      }
    });
    window.addEventListener("keyup", e => {
      let ch = String.fromCharCode(e.keyCode).toLowerCase();
      if (ch in this.invActionCtrls) {
        this.actionCtrls[this.invActionCtrls[ch][0]].updateFlag = false;
      }
      if (ch in this.invCameraCtrls) {
        let invCC = this.invCameraCtrls[ch];
        this.cameraCtrls[invCC[0]][invCC[1]].updateFlag = false;
      }
    });

    // begin render loop
    this.render();
  },

  beforeDestroy() {
    this.render = () => {};
  },

  methods: {
    generateCubeVertices(sz = 1) {
      // Ideal Triangle Strip: 3 2 6 7 4 2 0 3 1 6 5 4 1 0
      // --> 14 is the minimum numbers of points to define a cube with triangles.
      var verts = [
        mv.vec3(sz, -sz, sz), //0
        mv.vec3(-sz, -sz, sz), //1
        mv.vec3(sz, -sz, -sz), //2
        mv.vec3(-sz, -sz, -sz), //3
        mv.vec3(sz, sz, sz), //4
        mv.vec3(-sz, sz, sz), //5
        mv.vec3(-sz, sz, -sz), //6
        mv.vec3(sz, sz, -sz) //7
      ];

      //stripArray has all the vertices of a cube in the correct order to use just 1 triangle strip
      var stripArray = [];
      stripArray.push(verts[3]);
      stripArray.push(verts[2]);
      stripArray.push(verts[6]);
      stripArray.push(verts[7]);
      stripArray.push(verts[4]);
      stripArray.push(verts[2]);
      stripArray.push(verts[0]);
      stripArray.push(verts[3]);
      stripArray.push(verts[1]);
      stripArray.push(verts[6]);
      stripArray.push(verts[5]);
      stripArray.push(verts[4]);
      stripArray.push(verts[1]);
      stripArray.push(verts[0]);

      // Add strip array to our data object and add entry to buffer index
      Array.prototype.push.apply(this.dat.pos, stripArray);
      this.bufIdx.cube = {
        start: this.bufIdx.lastEnd,
        len: stripArray.length
      };
      wglu.updateBufferIndex(this.bufIdx, "cube", stripArray.length);
    },

    generateCrosshairVertices(stepSize) {
      // First add points that make a circle.
      var verts = [];
      for (var alpha = 0; alpha < 6.28; alpha = alpha + stepSize) {
        verts.push(mv.vec3(5 * Math.cos(alpha), 5 * Math.sin(alpha), 14.9));
      }
      Array.prototype.push.apply(this.dat.pos, verts);
      wglu.updateBufferIndex(this.bufIdx, "circle", verts.length);

      // now add plus sign to complete crosshair
      verts = [];
      verts.push(mv.vec3(7, 0, 14.9));
      verts.push(mv.vec3(-7, 0, 14.9));
      verts.push(mv.vec3(0, 7, 14.9));
      verts.push(mv.vec3(0, -7, 14.9));
      Array.prototype.push.apply(this.dat.pos, verts);
      wglu.updateBufferIndex(this.bufIdx, "plus", verts.length);
    },

    cube(position, sf, rf = "", rAxis = "") {
      return {
        position: mv.vec3(position),
        scalarFunction: sf,
        rotationFunction: rf,
        rotationAxis: rAxis
      };
    },

    configureWebGL() {
      [this.gl, this.p] = wglu.baseWebGL(
        "gl-canvas",
        "vertex-shader",
        "fragment-shader",
        [0.235, 0.482, 0.827, 1]
      );

      // Set Up Buffers
      this.buf.pos = wglu.buffer(this.gl, this.dat.pos);

      // Set up Shader Variables
      this.loc.a.vPos = wglu.attrib(this.gl, this.p, "vPos", 3, this.buf.pos);

      // Set up Uniform Locations
      var uName;
      for (uName of Object.keys(this.loc.u)) {
        this.loc.u[uName] = this.gl.getUniformLocation(this.p, uName);
      }
    },

    renderCube(num) {
      // Set the Cube Color
      let ci = (num + this.av.cIndex) % this.color.length;
      this.gl.uniform4f(
        this.loc.u.color,
        this.color[ci][0],
        this.color[ci][1],
        this.color[ci][2],
        this.color[ci][3]
      );

      //-----------Individually Scale or Rotate each Cube--------------
      let cubert = this.cubes[num];
      var t = mv.translationMatrix(cubert.position); // Move the vertexed cube to our rendering location
      var sr = mv.scalarMatrix(cubert.scalarFunction(this.av.dt));
      if (cubert.rotationAxis) {
        sr = mv.mult(
          sr,
          mv.rotationMatrix(
            cubert.rotationFunction(this.av.dt),
            cubert.rotationAxis
          )
        );
      }
      var mMat = mv.mult(t, sr);

      // Actually set the WebGl values
      this.gl.uniformMatrix4fv(this.loc.u.mMat, false, mv.flatten(mMat));
      wglu.draw(this.gl, this.gl.TRIANGLE_STRIP, this.bufIdx, "cube");
    },

    renderCrosshair() {
      if (this.av.showCrosshair) {
        // color is Red
        this.gl.uniform4f(
          this.loc.u.color,
          this.color[1][0],
          this.color[1][1],
          this.color[1][2],
          this.color[1][3]
        );
        this.gl.uniformMatrix4fv(this.loc.u.vMat, false, mv.flatten(mv.mat4()));
        this.gl.uniformMatrix4fv(this.loc.u.mMat, false, mv.flatten(mv.mat4()));
        this.gl.uniformMatrix4fv(
          this.loc.u.pMat,
          false,
          mv.flatten(
            mv.ortho(
              this.crosshair.left,
              this.crosshair.right,
              this.crosshair.bottom,
              this.crosshair.top,
              this.crosshair.near,
              this.crosshair.far
            )
          )
        );
        wglu.draw(this.gl, this.gl.LINE_LOOP, this.bufIdx, "circle");
        wglu.draw(this.gl, this.gl.LINES, this.bufIdx, "plus");
      }
    },

    render() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      // Action Updates
      wglu.executeActions(this.cameraCtrls.move, this.av);
      wglu.executeActions(this.cameraCtrls.look, this.av);
      wglu.executeActions(this.actionCtrls, this.av);
      this.av.dt = this.av.dt + 0.1; //keep tract of "time"

      // Take into account camera
      var vMat = wglc.viewMatrix(this.av.camera);
      var pMat = wglc.perspectiveMatrix(this.av.camera);
      this.gl.uniformMatrix4fv(this.loc.u.vMat, false, mv.flatten(vMat));
      this.gl.uniformMatrix4fv(this.loc.u.pMat, false, mv.flatten(pMat));

      for (let i = 0; i < this.cubes.length; ++i) {
        this.renderCube(i);
      }
      this.renderCrosshair(); // Crosshair has no view or model transofrmations

      wglu.requestAnimFrame()(this.render);
    }
  }
};
</script>
<style lang="scss"></style>
