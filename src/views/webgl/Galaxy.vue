<template>
  <div id="galaxy">
    <script id="vertex-shader" type="x-shader/x-vertex">
      precision mediump float;
      attribute vec3 vNorm, vFlatNorm, vPos;

      varying vec3 N, L, E;
      varying vec4 fcolor;

      uniform mat4 vMat, pMat, mMat;
      uniform vec4 lPos;

      uniform vec4 ambientProduct, diffuseProduct, specularProduct;
      uniform float shininess;
      uniform float shadingFlag;

      void main() {
        vec3 pos = (mMat * vec4(vPos, 1.0)).xyz;
        vec3 light = (lPos).xyz;
        L = normalize( light - pos );
        E = -pos;

        /* Flat Shading */
      	if (shadingFlag < 0.5) {
          N = normalize( (vec4(vFlatNorm, 0)).xyz);
        }

        /* Gourand or Phong Shading */
      	else {
          N = normalize( (vec4(vNorm, 0)).xyz);
        }

        /* Flat or Gourand Shading - Phong must be done in the fragment shader */
      	if (shadingFlag < 1.5) {
          vec3 H = normalize( L + E );
          vec4 ambient = ambientProduct;

          float Kd = max( dot(L, N), 0.0 );
          vec4  diffuse = Kd * diffuseProduct;

          float Ks = pow( max(dot(N, H), 0.0), shininess );
          vec4  specular = Ks * specularProduct;

          if( dot(L, N) < 0.0 || shininess == 0.0) specular = vec4(0.0, 0.0, 0.0, 1.0);

          fcolor = ambient + diffuse + specular;
          fcolor.a = 1.0;
      	}
        gl_Position =  pMat * vMat * mMat * vec4(vPos, 1.0);
      }
    </script>

    <script id="fragment-shader" type="x-shader/x-fragment">
      precision mediump float;

      uniform vec4 ambientProduct, diffuseProduct, specularProduct;
      uniform float shininess;
      uniform float shadingFlag;
      varying vec3 N, L, E;

      varying vec4 fcolor;
      void main() {

        /* Phong Shading */
        if (shadingFlag > 1.5) {
          vec4 FColor = fcolor;
          vec3 H = normalize( L + E );
          vec4 ambient = ambientProduct;

          float Kd = max( dot(L, N), 0.0 );
          vec4  diffuse = Kd*diffuseProduct;

          float Ks = pow( max(dot(N, H), 0.0), shininess );
          vec4  specular = Ks * specularProduct;

          if( dot(L, N) < 0.0 ) specular = vec4(0.0, 0.0, 0.0, 1.0);

          FColor = ambient + diffuse + specular;
          FColor.a = 1.0;

          gl_FragColor = FColor;
      	}

        /* Flat/Gourand shading completed in vertex shader */
      	else {
      	  gl_FragColor = fcolor;
        }
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
import Galaxy from "@/views/webgl/class/Galaxy.js";

// Mixin Aliases
var mv = MatrixMath.methods;
var wglu = WebGLUtils.methods;
var wglc = WebglCamera.methods;

export default {
  name: "GalaxyView",
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
          ambientProduct: "",
          diffuseProduct: "",
          specularProduct: "",
          shadingFlag: "",
        },
        // Attributes
        a: {
          pos: "", // Positions
          norm: "", // Normals
          flatNorm: "", // Flat Normals
        },
      },

      // GL BUffers
      buf: {
        pos: "",
        norm: "",
        flatNorm: "",
      },

      // [A]ction affected [V]ariables
      av: {
        camera: wglc.initCamera({
          position: mv.vec3(-15, 5, 0),
          stepSize: 0.1,
          theta: mv.rad(-30),
          near: 0.1,
          far: 1000,
        }),
        attachedToPlanet3: false,
        galaxy: "",
      },

      // Seed tetrahedron points to make the spheres
      seedPoints: {
        a: mv.vec3(0.0, 0.0, -1.0),
        b: mv.vec3(0.0, 0.942809, 0.333333),
        c: mv.vec3(-0.816497, -0.471405, 0.333333),
        d: mv.vec3(0.816497, -0.471405, 0.333333),
      },

      // light properties that represent our single point sun light soure
      lightSource: {
        position: mv.vec4(0.0, 0.0, 0.0, 1.0),
        ambient: mv.vec4(0.2, 0.2, 0.2, 1.0),
        diffuse: mv.vec4(0.7, 0.7, 0.7, 1.0),
        specular: mv.vec4(1.0, 1.0, 1.0, 1.0),
      },

      // set the min and max complexity
      minComplexity: 0,
      maxComplexity: 6,

      // Camera Keybind variables
      cameraCtrls: wglc.defaultControls(),
      invCameraCtrls: "", // initialize during mount

      // Other Keybind Variables
      actionCtrls: {
        toggleTime: {
          keybind: "p",
          icon: "fas fa-pause",
          desc: "Stop/start the universe",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: function (av) {
            av.galaxy.getTimer().toggleTimer();
          },
        },
        goToAboveView: {
          keybind: "t",
          icon: "fas fa-satellite",
          desc: "Move to an above view of teh galaxy, looking down",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: (av) => {
            this.resetAav(av, false, false);
            av.camera.theta = mv.rad(-90);
            av.camera.phi = 0;
            av.camera.position = mv.vec3(0, 25, 0);
            av.camera.orthoNormalUpdateFlag = true;
          },
        },
        attachToPlanet3: {
          keybind: "3",
          icon: "fas fa-link",
          desc: "Attach the camera to planet 3",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: (av) => {
            if (av.attachedToPlanet3) {
              this.resetAav(av);
            } else {
              av.attachedToPlanet3 = true;
              av.camera.near = 1.1;
            }
          },
        },
        revert: {
          keybind: "z",
          icon: "fas fa-undo",
          desc: "Revert to Original State",
          holdable: false,
          framesActive: 0,
          updateFlag: false,
          updateFxn: (av) => {
            this.resetAav(av, true, true);
          },
        },
      },
      invActionCtrls: "", // initialize during mount
    };
  },

  mounted() {
    // generate the data and configure webgl
    this.initGalaxy();
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
        [0.2, 0.2, 0.3, 1]
      );

      // Set Up Buffers
      this.buf.pos = wglu.buffer(this.gl, this.av.galaxy.getVertices());
      this.buf.norm = wglu.buffer(this.gl, this.av.galaxy.getNormals());
      this.buf.flatNorm = wglu.buffer(this.gl, this.av.galaxy.getFlatNormals());

      // Set up Attributes
      this.loc.a.pos = wglu.attrib(this.gl, this.p, "vPos", 3, this.buf.pos);
      this.loc.a.norm = wglu.attrib(this.gl, this.p, "vNorm", 3, this.buf.norm);
      this.loc.a.flatNorm = wglu.attrib(
        this.gl,
        this.p,
        "vFlatNorm",
        3,
        this.buf.flatNorm
      );

      // Set up Uniform Locations
      var uName;
      for (uName of Object.keys(this.loc.u)) {
        this.loc.u[uName] = this.gl.getUniformLocation(this.p, uName);
      }
    },

    resetAav(av, clearPlanets = false, resetTimer = false) {
      av.camera = wglc.initCamera(av.camera.initialProps);
      av.attachedToPlanet3 = false;
      if (clearPlanets) {
        av.galaxy.clearPlanets();
        this.addInitialPlanets();
      }
      if (resetTimer) {
        av.galaxy.getTimer().reset();
        av.galaxy.getTimer().resume();
      }
    },

    initGalaxy() {
      this.av.galaxy = new Galaxy(
        this.lightSource,
        this.seedPoints,
        this.minComplexity,
        this.maxComplexity
      );
      this.addInitialPlanets();
      this.av.galaxy.getTimer().resume();
    },

    addInitialPlanets() {
      // Planet 0 (Sun): Small, blue, medium-high complexity, gourand shading
      var material = this.material(
        [5, 2.5, 0],
        [0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0],
        0.0,
        "gourand"
      );
      var orbit = this.orbit();
      this.av.galaxy.addPlanet(3, 0.4, material, orbit, "Sun");

      // Planet 1: Small, icy-white, medium-low complexity, flat-shading, specular highlight
      material = this.material(
        [0.5, 0.5, 0.5],
        [0.9, 0.9, 0.9],
        [1.0, 1.0, 1.0],
        100.0,
        "flat"
      );
      orbit = this.orbit(1, 1.177, 0.3, 2);
      this.av.galaxy.addPlanet(4, 1, material, orbit, "Icicle I");

      // Planet 2: Medium, swampy-green, medium complexity, gourand shading, specular highlight
      material = this.material(
        [0.33 * 0.5, 0.42 * 0.5, 0.18 * 0.5],
        [0.25, 0.38, 0.13],
        [0.25, 0.38, 0.13],
        10.0,
        "gourand"
      );
      orbit = this.orbit(1, 1 / 2.3, 1.2, 7);
      this.av.galaxy.addPlanet(3, 1, material, orbit, "Swampert");

      // Planet 3: Medium, blue, high-complexity, phong shading, specular highlight
      material = this.material(
        [0.0, 0.0, 0.25],
        [0.0, 0.0, 0.8],
        [0.2, 0.2, 0.3],
        50.0,
        "phong"
      );
      orbit = this.orbit(1, -1 / 2.7, 0.3, 12);
      this.av.galaxy.addPlanet(6, 1.0, material, orbit, "Gargantia");

      // Planet 3.1 (moon 1 of planet 3):
      material = this.material(
        [1, 1, 0],
        [0.8, 0.7, 0.4],
        [1.0, 0.0, 0.0],
        50.0,
        "gourand"
      );
      orbit = this.orbit(1, 3, 0, 3);
      this.av.galaxy.addMoon([3], 5, 0.25, material, orbit, "Titan");

      // Planet 3.1.1 (moon 1 of moon 1 of planet 3):
      material = this.material(
        [0.7, 0.1, 0.5],
        [0.8, 0.0, 0.4],
        [1.0, 0.0, 0.0],
        50.0,
        "gourand"
      );
      orbit = this.orbit(1, 6, 0.2, 2);
      this.av.galaxy.addMoon([3, 0], 3, 0.125, material, orbit, "Sirens");

      // Planet 4: Medium, brown-orange, medium-complexity, gourand shading, no spectral highlight
      material = this.material(
        [0.2, 0.08, 0.01],
        [0.54 * 0.3, 0.27 * 0.3, 0.07 * 0.3],
        [0.54, 0.27, 0.17],
        0.0,
        "gourand"
      );
      orbit = this.orbit(1, 1 / 3.2, -0.8, 20);
      this.av.galaxy.addPlanet(5, 4, material, orbit, "Jupiter");
    },

    material(ambient, diffuse, specular, shininess, shading) {
      return {
        ambient: mv.vec4(ambient),
        diffuse: mv.vec4(diffuse),
        specular: mv.vec4(specular),
        shininess: shininess,
        shading: this.av.galaxy.getShadingFlag(shading),
      };
    },

    orbit(eccentricity = 0, omega = 0, phase = 0, radius = 0) {
      return {
        eccentricity: eccentricity,
        omega: omega,
        phase: phase,
        radius: radius,
      };
    },

    render() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      // Action Updates
      if (this.av.attachedToPlanet3) {
        var time = this.av.galaxy.getTimer().getTimeSec();
        var p3 = this.av.galaxy.getPlanetByIndex(3);
        this.av.camera.position = p3.getPosition(time);
        wglc.setAt(this.av.camera, mv.vec3(0, 0, 0));
      } else {
        wglu.executeActions(this.cameraCtrls.move, this.av);
        wglu.executeActions(this.cameraCtrls.look, this.av);
      }
      wglu.executeActions(this.actionCtrls, this.av);

      // View and perspective matrices
      var pMat = wglc.perspectiveMatrix(this.av.camera);
      var vMat = wglc.viewMatrix(this.av.camera);
      this.gl.uniformMatrix4fv(this.loc.u.vMat, false, mv.flatten(vMat));
      this.gl.uniformMatrix4fv(this.loc.u.pMat, false, mv.flatten(pMat));

      this.av.galaxy.animatePlanets(this.gl, this.loc);

      wglu.requestAnimFrame()(this.render);
    },
  },
};
</script>
<style lang="scss"></style>
