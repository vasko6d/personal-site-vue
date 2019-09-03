<template>
  <div id="cubert">
    <script id="vertex-shader" type="x-shader/x-vertex">
      attribute  vec4 vPos;
      uniform mat4 mvm;
      uniform mat4 proj;
      void main()
      {
          gl_Position = proj*mvm*vPos;
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
    <canvas id="gl-canvas" width="650px" height="650px"
      >Oops ... your browser doesn't support the HTML5 canvas element</canvas
    >
    <webgl-camera :camera="this.camera" />
    <ul>
      <li v-on:click="keyPressHandler('c')">"c" - Change Color of Cubes</li>
      <li v-on:click="keyPressHandler('x')">"x" - Display a Crosshair</li>
      <li v-on:click="keyPressHandler('z')">"z" - Revert to Original State</li>
    </ul>
  </div>
</template>
<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
import WebGLUtils from "@/mixins/webgl/WebGLUtils.vue";
import WebglCamera from "@/mixins/webgl/WebglCamera.vue";
//var Timer = require("../mixins/webgl/Timer.js");

// Mixin Aliases
var mv = MatrixMath.methods;
var wglu = WebGLUtils.methods;
var wglc = WebglCamera.methods;

export default {
  name: "Cubert",
  components: {
    WebglCamera
  },
  data() {
    return {
      // Web Gl Variables
      gl: "",
      program: "",
      loc: {
        color: "",
        mvm: "",
        proj: "",
        vPos: ""
      },
      val: {
        color: [
          mv.vec4(0.3, 0.3, 0.3, 1.0), // grey
          mv.vec4(1.0, 0.0, 0.0, 1.0), // red
          mv.vec4(1.0, 1.0, 0.0, 1.0), // yellow
          mv.vec4(0.0, 1.0, 0.0, 1.0), // green
          mv.vec4(0.0, 0.0, 1.0, 1.0), // blue
          mv.vec4(1.0, 0.0, 1.0, 1.0), // magenta
          mv.vec4(0.0, 1.0, 1.0, 1.0), // cyan
          mv.vec4(1.0, 1.0, 1.0, 1.0) // white
        ],
        mvm: mv.mat4(),
        proj: mv.mat4(),
        vPos: ""
      },
      buf: {
        points: ""
      },
      camera: wglc.initCamera(mv.vec3(30, 0, 0)),

      // Data Variables
      cubePositions: [
        mv.vec3(10, -10, -10),
        mv.vec3(10, -10, 10),
        mv.vec3(10, 10, -10),
        mv.vec3(10, 10, 10),
        mv.vec3(-10, -10, -10),
        mv.vec3(-10, -10, 10),
        mv.vec3(-10, 10, -10),
        mv.vec3(-10, 10, 10)
      ],
      crosshair: {
        near: -15,
        far: 15,
        left: -15.0,
        right: 15.0,
        top: 15.0,
        bottom: -15.0,
        show: false
      },
      vertices: this.generateCube().concat(this.generateCrosshair(0.1)),

      // Other Display Variables
      dt: 0.0,
      cIndex: 0,
      keepTime: true
    };
  },

  mounted() {
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
    generateCube() {
      // Ideal Triangle Strip: 3 2 6 7 4 2 0 3 1 6 5 4 1 0
      // --> 14 is the minimum numbers of points to define a cube with triangles.
      let len = 1;
      var verts = [
        mv.vec4(len, -len, len, 1.0), //0
        mv.vec4(-len, -len, len, 1.0), //1
        mv.vec4(len, -len, -len, 1.0), //2
        mv.vec4(-len, -len, -len, 1.0), //3
        mv.vec4(len, len, len, 1.0), //4
        mv.vec4(-len, len, len, 1.0), //5
        mv.vec4(-len, len, -len, 1.0), //6
        mv.vec4(len, len, -len, 1.0) //7
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
      return stripArray;
    },

    generateCrosshair(stepSize) {
      var vertices = [];
      // First add points that make a circle.
      for (var alpha = 0; alpha < 6.28; alpha = alpha + stepSize) {
        vertices.push(
          mv.vec4(5 * Math.cos(alpha), 5 * Math.sin(alpha), 14.9, 1)
        );
      }
      // now add plus sign to complete crosshair
      vertices.push(mv.vec4(7, 0, 14.9, 1));
      vertices.push(mv.vec4(-7, 0, 14.9, 1));
      vertices.push(mv.vec4(0, 7, 14.9, 1));
      vertices.push(mv.vec4(0, -7, 14.9, 1));
      return vertices;
    },

    keyPressHandler(ch) {
      // Change the colors
      if (ch === "c") {
        this.cIndex = (this.cIndex + 1) % 8;
      }
      // Display a crosshair
      if (ch === "x") {
        this.crosshair.show = !this.crosshair.show;
      }
      // Pause Time
      if (ch === "p") {
        this.keepTime = !this.keepTime;
      }
      // Revert to the original view with z
      if (ch === "z") {
        this.camera = wglc.initCamera(this.camera.origCameraPosition);
        this.dt = 0.0;
        this.cIndex = 0;
        this.keepTime = true;
        this.crosshair.show = false;
      }
      // pass the key to the default camera controller
      wglc.control(ch, this.camera);
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
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        mv.flatten(this.vertices),
        this.gl.STATIC_DRAW
      );

      // Set up Shader Variables
      this.loc.vPos = this.gl.getAttribLocation(this.program, "vPos");
      this.gl.vertexAttribPointer(this.loc.vPos, 4, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.loc.vPos);

      // Set up Uniform Locations
      this.loc.color = this.gl.getUniformLocation(this.program, "Color");
      this.loc.mvm = this.gl.getUniformLocation(this.program, "mvm");
      this.loc.proj = this.gl.getUniformLocation(this.program, "proj");
    },

    renderCube(num) {
      // Set the Cube Color
      let icIndex = (num + this.cIndex) % 8;
      this.gl.uniform4f(
        this.loc.color,
        this.val.color[icIndex][0],
        this.val.color[icIndex][1],
        this.val.color[icIndex][2],
        this.val.color[icIndex][3]
      );

      //-----------Individually Scale or Rotate each Cube--------------
      var m = mv.mat4();
      switch (num) {
        // Scaled Cubes
        case 0:
          m = mv.scalarMatrix(1 + 0.1 * Math.sin(this.dt / 2));
          break;
        case 1:
          m = mv.scalarMatrix(1 + 0.03 * Math.sin(this.dt + num / 1.17));
          break;
        case 6:
          m = mv.scalarMatrix(1 + 0.1 * Math.sin(this.dt + num / 1.17));
          break;
        case 7:
          m = mv.scalarMatrix(1 + 0.1 * Math.sin(this.dt * 2 + num / 1.17));
          break;
        // Rotated Cubes
        case 2:
          m = mv.rotationMatrix((this.dt * 180) / Math.PI / 2, [1, 0, 0]);
          break;
        case 3:
          m = mv.rotationMatrix((this.dt * 180) / Math.PI, [0, 1, 0]);
          break;
        case 4:
          m = mv.rotationMatrix((this.dt * 180) / Math.PI / 4, [0, 0, 1]);
          break;
        case 5:
          m = mv.rotationMatrix((this.dt * 180) / Math.PI, [1, 1, 1]);
          break;
      }
      var t = mv.translationMatrix(this.cubePositions[num]); // Move the vertexed cube to our rendering location
      var cubeChangeMatrix = mv.mult(mv.mult(this.val.mvm, t), m);

      // Actually set the WebGl values
      this.gl.uniformMatrix4fv(
        this.loc.mvm,
        false,
        mv.flatten(cubeChangeMatrix)
      );
      this.gl.uniformMatrix4fv(this.loc.proj, false, mv.flatten(this.val.proj));
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 14);
    },

    render() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      let at = mv.vec3(
        Math.cos(this.camera.theta) * Math.cos(this.camera.phi),
        Math.sin(this.camera.theta),
        Math.cos(this.camera.theta) * Math.sin(this.camera.phi)
      ); // Initially [1, 0, 0]: on the positive x-axis looking toward the origin

      this.dt = this.dt + 0.1; //keep tract of "time"

      // Take into account camera
      this.val.mvm = mv.mult(
        mv.lookAt(this.camera.eye, at, this.camera.up),
        this.camera.translation
      );
      this.val.proj = mv.perspective(this.camera.fovy, 1.0, 0.1, 100);

      // Render Each Cube
      for (let i = 0; i < this.cubePositions.length; ++i) {
        this.renderCube(i);
      }

      // Render the Crosshair
      if (this.crosshair.show) {
        this.gl.uniform4f(
          this.loc.color,
          this.val.color[1][0],
          this.val.color[1][1],
          this.val.color[1][2],
          this.val.color[1][3]
        ); // color is Red
        this.gl.uniformMatrix4fv(this.loc.mvm, false, mv.flatten(mv.mat4()));
        this.gl.uniformMatrix4fv(
          this.loc.proj,
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
        this.gl.drawArrays(this.gl.LINE_LOOP, 14, 63); // NOTE: hardcoded vertex numbers
        this.gl.drawArrays(this.gl.LINES, 77, 4);
      }

      wglu.requestAnimFrame()(this.render);
    }
  }
};
</script>
<style lang="scss"></style>
