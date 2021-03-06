<template>
  <div id="ff-vii-textures">
    <script id="vertex-shader" type="x-shader/x-vertex">
      /* The data in 3d space */
      attribute vec3 vPos; /* Actual vertex positions */
      attribute vec3 vNorm; /* Normal vector for each vertex */
      attribute vec2 vUV; /* Texture coordinate system UV */
      uniform vec3 lPos; /*[l]ight [pos]ition */

      /* Transformations that will transform the data */
      uniform mat4 vMat; /* [v]iew [m]atrix */
      uniform mat4 mMat; /* [m]odel [m]atrix */
      uniform mat4 pMat; /* [p]rojection [m]atrix */

      /* Texture Uniforms for Scaling, Rotating and Translating */
      uniform float texS; /* [tex]ture [s]cale */
      uniform mat2 texR; /* [tex]ture [r]otate */
      uniform float texT; /* [tex]ture [t]ranslate */

      /* Fragment Shader Variables */
      varying vec3 fL, fE, fN;
      varying vec2 fUV;

      void main(){
          vec3 pos = (vMat * mMat * vec4(vPos, 1.0)).xyz;
      	  vec3 light = (vMat * vec4(lPos, 1.0)).xyz; /* light position in camera space */

          fL = normalize(light - pos);
          fE = normalize(-pos);
          fN = normalize(vMat * mMat * vec4(vNorm, 0.0)).xyz;

          fUV = texR * (vUV - vec2(0.5,0.5)) * texS + vec2(0.5, 0.5 + texT * texS);
          gl_Position = pMat * vec4(pos, 1.0);
      }
    </script>
    <script id="fragment-shader" type="x-shader/x-fragment">
      precision mediump float;

      varying vec3 fL, fE, fH, fN;
      varying vec2 fUV;
      uniform sampler2D uSampler;
      uniform float shininess;

      void main(){
          vec3 fH = normalize(fL + fE);

          vec4 texC = texture2D(uSampler, fUV); /* [tex]ture [c]olor */
          vec4 ambient = 0.2 * texC;
          float kd = max(dot(fL, fN), 0.0);
          vec4 diffuse = kd * 0.6 * texC;

          float ks = pow(max(dot(fN, fH), 0.0), shininess);
          vec4 specular =  0.4 * ks * vec4(1.0, 1.0, 1.0, 1.0);
      	  if(dot(fN,fL) < 0.0){
            specular = vec4(0.0, 0.0, 0.0, 1.0);
          }

          vec4 fColor = ambient + diffuse + specular;
          fColor.a  = 1.0;

          gl_FragColor = fColor;
      }
    </script>

    <div>
      <canvas id="gl-canvas" width="650px" height="650px"
        >Oops ... your browser doesn't support the HTML5 canvas element</canvas
      >
    </div>
    <div class="blk-container">
      <webgl-camera :camera="av.camera" :ctrls="cameraCtrls" />
      <action-controls :actionCtrls="actionCtrls" />
    </div>
  </div>
</template>
<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
import WebGLUtils from "@/mixins/webgl/WebGLUtils.vue";
import WebglCamera from "@/components/webgl/WebglCamera.vue";
import ActionControls from "@/components/webgl/ActionControls.vue";
import Timer from "@/mixins/webgl/Timer.js";

// Mixin Aliases
var mv = MatrixMath.methods;
var wglu = WebGLUtils.methods;
var wglc = WebglCamera.methods;

export default {
  name: "FfViiTextures",
  components: {
    WebglCamera,
    ActionControls,
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
          lPos: "", // single source light position
          shininess: "",
          uSampler: "",
          texS: "", // texture scaler
          texR: "", // textrue 2d rotation
          texT: "", // texture translation
        },
        // Attributes
        a: {
          pos: "", // Position
          norm: "", // Normal
          uv: "", // UV
        },
      },

      // The value/buffer that goes with those variables
      val: {
        lPos: mv.vec3(-2.0, 2.0, 2.0),
        shininess: 50,
      },
      buf: {
        pos: "",
        norm: "",
        uv: "",
      },

      // The data that will be tied to a buffer
      dat: {
        pos: [],
        norm: [],
        uv: [],
      },

      // [A]ction affected [V]ariables
      av: {
        textures: [],
        floorTexture: "",
        cubeRotTimer: new Timer(),
        texRotTimer: new Timer(),
        texScrTimer: new Timer(),
        camera: wglc.initCamera({
          position: mv.vec3(-3, 0, 0),
          stepSize: 0.05,
          near: 0.001,
          far: 1000,
        }),
        textureIndex: 1,
      },

      // Camera Keybind variables
      cameraCtrls: wglc.defaultControls(),
      invCameraCtrls: "", // initialize during mount

      // Other Keybind Variables
      actionCtrls: {
        toggleCubeRotation: {
          keybind: "r",
          icon: "fas fa-sync-alt",
          desc: "Toggle Rotation of Both Cubes",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function (av) {
            av.cubeRotTimer.toggleTimer();
          },
        },
        changeTexture: {
          keybind: "t",
          icon: "fas fa-palette",
          desc: "Change the texture image",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function (av) {
            av.textureIndex = (av.textureIndex + 1) % 3;
          },
        },
        revert: {
          keybind: "z",
          icon: "fas fa-undo",
          desc: "Revert to Original State",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function (av) {
            av.camera = wglc.initCamera(av.camera.initialProps);
            av.cubeRotTimer.reset();
            av.texRotTimer.reset();
            av.texScrTimer.reset();
            av.textureIndex = 1;
          },
        },
        toggleTextureScrolling: {
          keybind: "f",
          icon: "fas fa-scroll",
          desc: "Toggle Texture Scrolling on Left Cube",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function (av) {
            av.texScrTimer.toggleTimer();
          },
        },
        toggleTextureRotation: {
          keybind: "g",
          icon: "fas fa-directions",
          desc: "Toggle Texture Rotation on Right Cube",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function (av) {
            av.texRotTimer.toggleTimer();
          },
        },
      },
      invActionCtrls: "", // initialize during mount
    };
  },

  mounted() {
    // Initialize data then webgl
    this.generateData(0.5);
    this.configureWebGL();

    // Invert the conrtols and the keybinding for simple character lookups
    this.invCameraCtrls = {
      ...wglu.getInvertedControlObject(this.cameraCtrls.move, "move"),
      ...wglu.getInvertedControlObject(this.cameraCtrls.look, "look"),
    };
    this.invActionCtrls = wglu.getInvertedControlObject(this.actionCtrls);

    // Define Keyboard listeners
    window.addEventListener("keydown", (e) => {
      let ch = String.fromCharCode(e.keyCode).toLowerCase();
      if (ch in this.invActionCtrls) {
        this.actionCtrls[this.invActionCtrls[ch][0]].updateFlag = true;
      }
      if (ch in this.invCameraCtrls) {
        let invCC = this.invCameraCtrls[ch];
        this.cameraCtrls[invCC[0]][invCC[1]].updateFlag = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      let ch = String.fromCharCode(e.keyCode).toLowerCase();
      if (ch in this.invActionCtrls) {
        this.actionCtrls[this.invActionCtrls[ch][0]].updateFlag = false;
      }
      if (ch in this.invCameraCtrls) {
        let invCC = this.invCameraCtrls[ch];
        this.cameraCtrls[invCC[0]][invCC[1]].updateFlag = false;
      }
    });

    // Start Render loop
    this.render();
  },

  beforeDestroy() {
    this.render = () => {};
  },

  methods: {
    configureWebGL() {
      [this.gl, this.p] = wglu.baseWebGL(
        "gl-canvas",
        "vertex-shader",
        "fragment-shader",
        [0.235, 0.482, 0.827, 1]
      );

      // Set up textures we will be using
      this.av.textures.push(
        this.createTexture(this.gl, require("@/assets/img/webgl-chrome.jpg"))
      );
      this.av.textures.push(
        this.createTexture(this.gl, require("@/assets/img/webgl-ff7.png"))
      );
      this.av.textures.push(
        this.createTexture(this.gl, require("@/assets/img/webgl-bark.jpg"))
      );
      this.av.floorTexture = this.createTexture(
        this.gl,
        require("@/assets/img/webgl-ground.jpg")
      );

      // Set Up Buffers
      this.buf.pos = wglu.buffer(this.gl, this.dat.pos);
      this.buf.norm = wglu.buffer(this.gl, this.dat.norm);
      this.buf.uv = wglu.buffer(this.gl, this.dat.uv);

      // Set up Attributes
      this.loc.a.pos = wglu.attrib(this.gl, this.p, "vPos", 3, this.buf.pos);
      this.loc.a.norm = wglu.attrib(this.gl, this.p, "vNorm", 3, this.buf.norm);
      this.loc.a.uv = wglu.attrib(this.gl, this.p, "vUV", 2, this.buf.uv);

      // Set up Uniform Locations
      var uName;
      for (uName of Object.keys(this.loc.u)) {
        this.loc.u[uName] = this.gl.getUniformLocation(this.p, uName);
      }

      // Constant Uniforms
      this.gl.uniform3fv(this.loc.u.lPos, mv.flatten(this.val.lPos));
    },

    createTexture(gl, imgSrc, singlePixelColor) {
      var t = gl.createTexture();

      // temporarly use single pixel texture while texture image loads
      wglu.bindSinglePixelTexture(gl, t, singlePixelColor);

      // actual texture image
      if (imgSrc) {
        t.image = new Image();
        t.image.onload = function () {
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            t.image
          );

          // mipmap only works on inages of dimension base 2
          gl.generateMipmap(gl.TEXTURE_2D);

          //use nearest neighbor for zooming in
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

          //use mipmap trilinear filtering for zoomed out
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR_MIPMAP_LINEAR
          );

          //use repeat to make the texture repeat in both the s and t directions
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        };
        t.image.src = imgSrc;
      }
      gl.bindTexture(gl.TEXTURE_2D, null); // unbind texture

      return t;
    },

    generateData(sz) {
      // 3d coordinates that represent eight corners of a cube
      var verts = [
        mv.vec3(sz, sz, sz),
        mv.vec3(sz, -sz, sz),
        mv.vec3(-sz, sz, sz),
        mv.vec3(-sz, -sz, sz),
        mv.vec3(sz, sz, -sz),
        mv.vec3(sz, -sz, -sz),
        mv.vec3(-sz, sz, -sz),
        mv.vec3(-sz, -sz, -sz),
      ];

      // Each face is made up of 4 vertices. The orientation of a mapped
      // texture will depend onthe order that the vertices are specified
      var vo = [
        [0, 1, 2, 3],
        [4, 0, 6, 2],
        [4, 5, 0, 1],
        [2, 3, 6, 7],
        [6, 7, 4, 5],
        [1, 5, 3, 7],
      ];

      // THe 6 different normal vectors for each face of the cube
      var ns = [
        mv.vec3(0, 0, 1),
        mv.vec3(0, 1, 0),
        mv.vec3(1, 0, 0),
        mv.vec3(-1, 0, 0),
        mv.vec3(0, 0, -1),
        mv.vec3(0, -1, 0),
      ];

      var d = this.dat;
      for (let i = 0; i < 6; i++) {
        this.quad(verts, vo[i], ns[i], d.pos, d.norm, d.uv);
      }
    },

    quad(vertices, vertexOrder, normalVector, points, normals, uvs) {
      // Add the vertices that specify the triangular pieces to make
      // the cube face
      points.push(vertices[vertexOrder[0]]);
      points.push(vertices[vertexOrder[2]]);
      points.push(vertices[vertexOrder[3]]);
      points.push(vertices[vertexOrder[0]]);
      points.push(vertices[vertexOrder[3]]);
      points.push(vertices[vertexOrder[1]]);

      // All six points of each cube side will and should have the
      // same normal vector
      Array(6)
        .fill(normalVector)
        .forEach(function (n) {
          normals.push(n);
        });

      // Fill the uv array for mapping the texture to the surface
      uvs.push(mv.vec2(1, 0));
      uvs.push(mv.vec2(0, 0));
      uvs.push(mv.vec2(0, 1));
      uvs.push(mv.vec2(1, 0));
      uvs.push(mv.vec2(0, 1));
      uvs.push(mv.vec2(1, 1));
    },

    renderCube(dz, deg, axis, tScale, tRotMat, tTransVal) {
      var mMat = mv.mult(
        mv.translationMatrix(mv.vec3(0, 0, dz)),
        mv.rotationMatrix(this.av.cubeRotTimer.getTimeSec() * deg, axis)
      );
      this.gl.uniformMatrix4fv(this.loc.u.mMat, false, mv.flatten(mMat));

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        this.av.textures[this.av.textureIndex]
      );
      this.gl.uniform1i(this.loc.u.uSampler, 0);

      this.gl.uniform1f(this.loc.u.texS, tScale);
      this.gl.uniformMatrix2fv(this.loc.u.texR, false, mv.flatten(tRotMat));
      this.gl.uniform1f(this.loc.u.texT, tTransVal);

      this.gl.uniform1f(this.loc.u.shininess, this.val.shininess);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
    },

    renderFloorCube() {
      var mMat = mv.mult(
        mv.scalarMatrix([1000, 0.1, 1000]),
        mv.translationMatrix(mv.vec3(0, -10, 0))
      );
      this.gl.uniformMatrix4fv(this.loc.u.mMat, false, mv.flatten(mMat));

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.av.floorTexture);
      this.gl.uniform1i(this.loc.u.uSampler, 0);

      this.gl.uniform1f(this.loc.u.texS, 500);
      this.gl.uniformMatrix2fv(this.loc.u.texR, false, mv.flatten(mv.mat2()));
      this.gl.uniform1f(this.loc.u.texT, 0);

      this.gl.uniform1f(this.loc.u.shininess, 0.0);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
    },

    render() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      // Action Updates
      wglu.executeActions(this.cameraCtrls.move, this.av);
      wglu.executeActions(this.cameraCtrls.look, this.av);
      wglu.executeActions(this.actionCtrls, this.av);

      // Take into account camera
      var vMat = wglc.viewMatrix(this.av.camera);
      var pMat = wglc.perspectiveMatrix(this.av.camera);
      this.gl.uniformMatrix4fv(this.loc.u.vMat, false, mv.flatten(vMat));
      this.gl.uniformMatrix4fv(this.loc.u.pMat, false, mv.flatten(pMat));

      // Now Render Each Cube
      this.renderCube(
        0.75,
        360,
        [0, 1, 0],
        1,
        mv.rotationMatrix2d(this.av.texRotTimer.getTimeSec() * 360),
        0.0
      );
      this.renderCube(
        -0.75,
        180,
        [1, 0, 0],
        2,
        mv.mat2(),
        (this.av.texScrTimer.getTimeSec() % 2) - 1
      );
      this.renderFloorCube();

      wglu.requestAnimFrame()(this.render);
    },
  },
};
</script>
<style lang="scss"></style>
