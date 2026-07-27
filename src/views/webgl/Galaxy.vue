<template>
  <div id="galaxy">
    <div>
      <canvas id="gl-canvas" width="650px" height="650px">Oops ... your browser doesn't support the HTML5 canvas element</canvas>
    </div>
    <div class="blk-container">
      <WebglCamera :camera="av.camera" :ctrls="cameraCtrls" />
      <ActionControls :actionCtrls="actionCtrls" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from "vue";
import * as mv from "@/utils/webgl/MatrixMath";
import * as wglu from "@/utils/webgl/WebGLUtils";
import * as wglc from "@/utils/webgl/Camera";
import WebglCamera from "@/components/webgl/WebglCamera.vue";
import ActionControls from "@/components/webgl/ActionControls.vue";
import GalaxyClass, { type SeedPoints } from "@/views/webgl/class/Galaxy";
import type { Light, Material, Orbit } from "@/views/webgl/class/Planet";
import type { ActionCtrlMap, CameraCtrlMap, Camera } from "@/utils/webgl/types";

const vertexShaderSrc = `
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
`;
const fragmentShaderSrc = `
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
`;

interface Av {
  camera: Camera;
  attachedToPlanet3: boolean;
  galaxy: GalaxyClass | null;
}

// Web Gl Variables
let gl: WebGLRenderingContext; // [g]raphics [l]ibrary
let p: WebGLProgram; // Shader [p]rogram

interface UniformLocs {
  pMat: WebGLUniformLocation | null; // projection matrix
  vMat: WebGLUniformLocation | null; // view matrix
  mMat: WebGLUniformLocation | null; // model matrix
  lPos: WebGLUniformLocation | null; // single source light position
  shininess: WebGLUniformLocation | null;
  ambientProduct: WebGLUniformLocation | null;
  diffuseProduct: WebGLUniformLocation | null;
  specularProduct: WebGLUniformLocation | null;
  shadingFlag: WebGLUniformLocation | null;
  [key: string]: WebGLUniformLocation | null;
}

// Location to the variables used in the shader programs
const loc = {
  // Uniforms
  u: {
    pMat: null,
    vMat: null,
    mMat: null,
    lPos: null,
    shininess: null,
    ambientProduct: null,
    diffuseProduct: null,
    specularProduct: null,
    shadingFlag: null,
  } as UniformLocs,
  // Attributes
  a: {
    pos: 0, // Positions
    norm: 0, // Normals
    flatNorm: 0, // Flat Normals
  },
};

// GL Buffers
const buf: { pos: WebGLBuffer | null; norm: WebGLBuffer | null; flatNorm: WebGLBuffer | null } = {
  pos: null,
  norm: null,
  flatNorm: null,
};

// [A]ction affected [V]ariables
const av: Av = reactive({
  camera: wglc.initCamera({
    position: mv.vec3(-15, 5, 0),
    stepSize: 0.1,
    theta: mv.rad(-30),
    near: 0.1,
    far: 1000,
  }),
  attachedToPlanet3: false,
  galaxy: null,
});

// Seed tetrahedron points to make the spheres
const seedPoints: SeedPoints = {
  a: mv.vec3(0.0, 0.0, -1.0),
  b: mv.vec3(0.0, 0.942809, 0.333333),
  c: mv.vec3(-0.816497, -0.471405, 0.333333),
  d: mv.vec3(0.816497, -0.471405, 0.333333),
};

// light properties that represent our single point sun light soure
const lightSource: Light = {
  position: mv.vec4(0.0, 0.0, 0.0, 1.0),
  ambient: mv.vec4(0.2, 0.2, 0.2, 1.0),
  diffuse: mv.vec4(0.7, 0.7, 0.7, 1.0),
  specular: mv.vec4(1.0, 1.0, 1.0, 1.0),
};

// set the min and max complexity
const minComplexity = 0;
const maxComplexity = 6;

// Camera Keybind variables
const cameraCtrls: CameraCtrlMap<Av> = reactive(wglc.defaultControls() as unknown as CameraCtrlMap<Av>);
let invCameraCtrls: Record<string, string[]> = {}; // initialize during mount

function resetAav(av: Av, clearPlanets = false, resetTimer = false) {
  av.camera = wglc.initCamera(av.camera.initialProps);
  av.attachedToPlanet3 = false;
  if (clearPlanets) {
    av.galaxy!.clearPlanets();
    addInitialPlanets();
  }
  if (resetTimer) {
    av.galaxy!.getTimer().reset();
    av.galaxy!.getTimer().resume();
  }
}

// Other Keybind Variables
const actionCtrls = reactive<ActionCtrlMap<Av>>({
  toggleTime: {
    keybind: "p",
    icon: "fas fa-pause",
    desc: "Stop/start the universe",
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.galaxy!.getTimer().toggleTimer();
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
      resetAav(av, false, false);
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
        resetAav(av);
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
      resetAav(av, true, true);
    },
  },
});
let invActionCtrls: Record<string, string[]> = {}; // initialize during mount

function configureWebGL() {
  [gl, p] = wglu.baseWebGL("gl-canvas", "vertex-shader", "fragment-shader", [0.2, 0.2, 0.3, 1]);

  // Set Up Buffers
  buf.pos = wglu.buffer(gl, av.galaxy!.getVertices());
  buf.norm = wglu.buffer(gl, av.galaxy!.getNormals());
  buf.flatNorm = wglu.buffer(gl, av.galaxy!.getFlatNormals());

  // Set up Attributes
  loc.a.pos = wglu.attrib(gl, p, "vPos", 3, buf.pos);
  loc.a.norm = wglu.attrib(gl, p, "vNorm", 3, buf.norm);
  loc.a.flatNorm = wglu.attrib(gl, p, "vFlatNorm", 3, buf.flatNorm);

  // Set up Uniform Locations
  for (const uName of Object.keys(loc.u)) {
    loc.u[uName] = gl.getUniformLocation(p, uName);
  }
}

function initGalaxy() {
  av.galaxy = new GalaxyClass(lightSource, seedPoints, minComplexity, maxComplexity);
  addInitialPlanets();
  av.galaxy.getTimer().resume();
}

function material(ambient: number[], diffuse: number[], specular: number[], shininess: number, shading: string): Material {
  return {
    ambient: mv.vec4(ambient),
    diffuse: mv.vec4(diffuse),
    specular: mv.vec4(specular),
    shininess: shininess,
    shading: av.galaxy!.getShadingFlag(shading),
  };
}

function orbit(eccentricity = 0, omega = 0, phase = 0, radius = 0): Orbit {
  return {
    eccentricity: eccentricity,
    omega: omega,
    phase: phase,
    radius: radius,
  };
}

function addInitialPlanets() {
  // Planet 0 (Sun): Small, blue, medium-high complexity, gourand shading
  let mat = material([5, 2.5, 0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 0.0, "gourand");
  let orb = orbit();
  av.galaxy!.addPlanet(3, 0.4, mat, orb, "Sun");

  // Planet 1: Small, icy-white, medium-low complexity, flat-shading, specular highlight
  mat = material([0.5, 0.5, 0.5], [0.9, 0.9, 0.9], [1.0, 1.0, 1.0], 100.0, "flat");
  orb = orbit(1, 1.177, 0.3, 2);
  av.galaxy!.addPlanet(4, 1, mat, orb, "Icicle I");

  // Planet 2: Medium, swampy-green, medium complexity, gourand shading, specular highlight
  mat = material([0.33 * 0.5, 0.42 * 0.5, 0.18 * 0.5], [0.25, 0.38, 0.13], [0.25, 0.38, 0.13], 10.0, "gourand");
  orb = orbit(1, 1 / 2.3, 1.2, 7);
  av.galaxy!.addPlanet(3, 1, mat, orb, "Swampert");

  // Planet 3: Medium, blue, high-complexity, phong shading, specular highlight
  mat = material([0.0, 0.0, 0.25], [0.0, 0.0, 0.8], [0.2, 0.2, 0.3], 50.0, "phong");
  orb = orbit(1, -1 / 2.7, 0.3, 12);
  av.galaxy!.addPlanet(6, 1.0, mat, orb, "Gargantia");

  // Planet 3.1 (moon 1 of planet 3):
  mat = material([1, 1, 0], [0.8, 0.7, 0.4], [1.0, 0.0, 0.0], 50.0, "gourand");
  orb = orbit(1, 3, 0, 3);
  av.galaxy!.addMoon([3], 5, 0.25, mat, orb, "Titan");

  // Planet 3.1.1 (moon 1 of moon 1 of planet 3):
  mat = material([0.7, 0.1, 0.5], [0.8, 0.0, 0.4], [1.0, 0.0, 0.0], 50.0, "gourand");
  orb = orbit(1, 6, 0.2, 2);
  av.galaxy!.addMoon([3, 0], 3, 0.125, mat, orb, "Sirens");

  // Planet 4: Medium, brown-orange, medium-complexity, gourand shading, no spectral highlight
  mat = material([0.2, 0.08, 0.01], [0.54 * 0.3, 0.27 * 0.3, 0.07 * 0.3], [0.54, 0.27, 0.17], 0.0, "gourand");
  orb = orbit(1, 1 / 3.2, -0.8, 20);
  av.galaxy!.addPlanet(5, 4, mat, orb, "Jupiter");
}

let render: () => void = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Action Updates
  if (av.attachedToPlanet3) {
    const time = av.galaxy!.getTimer().getTimeSec();
    const p3 = av.galaxy!.getPlanetByIndex(3);
    av.camera.position = p3.getPosition(time);
    wglc.setAt(av.camera, mv.vec3(0, 0, 0));
  } else {
    wglu.executeActions(cameraCtrls.move!, av);
    wglu.executeActions(cameraCtrls.look!, av);
  }
  wglu.executeActions(actionCtrls, av);

  // View and perspective matrices
  const pMat = wglc.perspectiveMatrix(av.camera);
  const vMat = wglc.viewMatrix(av.camera);
  gl.uniformMatrix4fv(loc.u.vMat, false, mv.flatten(vMat));
  gl.uniformMatrix4fv(loc.u.pMat, false, mv.flatten(pMat));

  av.galaxy!.animatePlanets(gl, loc as unknown as Parameters<GalaxyClass["animatePlanets"]>[1]);

  wglu.requestAnimFrame()(render);
};

onMounted(() => {
  // generate the data and configure webgl
  initGalaxy();
  wglu.injectShaderScript("vertex-shader", "x-shader/x-vertex", vertexShaderSrc);
  wglu.injectShaderScript("fragment-shader", "x-shader/x-fragment", fragmentShaderSrc);
  configureWebGL();

  // Invert the conrtols and the keybinding for simple character lookups
  invCameraCtrls = {
    ...wglu.getInvertedControlObject(cameraCtrls.move!, "move"),
    ...wglu.getInvertedControlObject(cameraCtrls.look!, "look"),
  };
  invActionCtrls = wglu.getInvertedControlObject(actionCtrls);

  // Define Keyboard listeners
  window.addEventListener("keydown", (e) => {
    const ch = String.fromCharCode(e.keyCode).toLowerCase();
    if (ch in invActionCtrls) {
      actionCtrls[invActionCtrls[ch]![0]!]!.updateFlag = true;
    }
    if (ch in invCameraCtrls) {
      const invCC = invCameraCtrls[ch]!;
      cameraCtrls[invCC[0]!]![invCC[1]!]!.updateFlag = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    const ch = String.fromCharCode(e.keyCode).toLowerCase();
    if (ch in invActionCtrls) {
      actionCtrls[invActionCtrls[ch]![0]!]!.updateFlag = false;
    }
    if (ch in invCameraCtrls) {
      const invCC = invCameraCtrls[ch]!;
      cameraCtrls[invCC[0]!]![invCC[1]!]!.updateFlag = false;
    }
  });

  // Start Render loop
  render();
});

onUnmounted(() => {
  render = () => {};
  wglu.removeShaderScript("vertex-shader");
  wglu.removeShaderScript("fragment-shader");
});
</script>
