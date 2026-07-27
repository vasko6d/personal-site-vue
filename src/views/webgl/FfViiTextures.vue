<template>
  <div id="ff-vii-textures">
    <div>
      <canvas id="gl-canvas" width="650px" height="650px"
        >Oops ... your browser doesn't support the HTML5 canvas element</canvas
      >
    </div>
    <div class="blk-container">
      <WebglCamera :camera="av.camera" :ctrls="cameraCtrls" />
      <ActionControls :actionCtrls="actionCtrls" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue'
import * as mv from '@/utils/webgl/MatrixMath'
import type { Vec, Mat } from '@/utils/webgl/MatrixMath'
import * as wglu from '@/utils/webgl/WebGLUtils'
import * as wglc from '@/utils/webgl/Camera'
import WebglCamera from '@/components/webgl/WebglCamera.vue'
import ActionControls from '@/components/webgl/ActionControls.vue'
import Timer from '@/utils/webgl/Timer'
import type { ActionCtrlMap, CameraCtrlMap, Camera } from '@/utils/webgl/types'

import webglChrome from '@/assets/img/webgl-chrome.jpg'
import webglFf7 from '@/assets/img/webgl-ff7.png'
import webglBark from '@/assets/img/webgl-bark.jpg'
import webglGround from '@/assets/img/webgl-ground.jpg'

const vertexShaderSrc = `
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
`
const fragmentShaderSrc = `
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
`

interface Av {
  textures: WebGLTexture[]
  floorTexture: WebGLTexture | null
  cubeRotTimer: Timer
  texRotTimer: Timer
  texScrTimer: Timer
  camera: Camera
  textureIndex: number
}

// Web Gl Variables
let gl: WebGLRenderingContext // [g]raphics [l]ibrary
let p: WebGLProgram // Shader [p]rogram

interface UniformLocs {
  pMat: WebGLUniformLocation | null
  vMat: WebGLUniformLocation | null
  mMat: WebGLUniformLocation | null
  lPos: WebGLUniformLocation | null
  shininess: WebGLUniformLocation | null
  uSampler: WebGLUniformLocation | null
  texS: WebGLUniformLocation | null
  texR: WebGLUniformLocation | null
  texT: WebGLUniformLocation | null
  [key: string]: WebGLUniformLocation | null
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
    uSampler: null,
    texS: null,
    texR: null,
    texT: null,
  } as UniformLocs,
  // Attributes
  a: {
    pos: 0,
    norm: 0,
    uv: 0,
  },
}

// The value/buffer that goes with those variables
const val = {
  lPos: mv.vec3(-2.0, 2.0, 2.0),
  shininess: 50,
}
const buf: { pos: WebGLBuffer | null; norm: WebGLBuffer | null; uv: WebGLBuffer | null } = {
  pos: null,
  norm: null,
  uv: null,
}

// The data that will be tied to a buffer
const dat: { pos: Vec[]; norm: Vec[]; uv: Vec[] } = {
  pos: [],
  norm: [],
  uv: [],
}

// [A]ction affected [V]ariables
const av: Av = reactive({
  textures: [],
  floorTexture: null,
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
})

// Camera Keybind variables
const cameraCtrls: CameraCtrlMap<Av> = reactive(
  wglc.defaultControls() as unknown as CameraCtrlMap<Av>,
)
let invCameraCtrls: Record<string, string[]> = {} // initialize during mount

// Other Keybind Variables
const actionCtrls = reactive<ActionCtrlMap<Av>>({
  toggleCubeRotation: {
    keybind: 'r',
    icon: 'fas fa-sync-alt',
    desc: 'Toggle Rotation of Both Cubes',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.cubeRotTimer.toggleTimer()
    },
  },
  changeTexture: {
    keybind: 't',
    icon: 'fas fa-palette',
    desc: 'Change the texture image',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.textureIndex = (av.textureIndex + 1) % 3
    },
  },
  revert: {
    keybind: 'z',
    icon: 'fas fa-undo',
    desc: 'Revert to Original State',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.camera = wglc.initCamera(av.camera.initialProps)
      av.cubeRotTimer.reset()
      av.texRotTimer.reset()
      av.texScrTimer.reset()
      av.textureIndex = 1
    },
  },
  toggleTextureScrolling: {
    keybind: 'f',
    icon: 'fas fa-scroll',
    desc: 'Toggle Texture Scrolling on Left Cube',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.texScrTimer.toggleTimer()
    },
  },
  toggleTextureRotation: {
    keybind: 'g',
    icon: 'fas fa-directions',
    desc: 'Toggle Texture Rotation on Right Cube',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.texRotTimer.toggleTimer()
    },
  },
})
let invActionCtrls: Record<string, string[]> = {} // initialize during mount

function createTexture(
  gl: WebGLRenderingContext,
  imgSrc?: string,
  singlePixelColor?: [number, number, number, number],
): WebGLTexture {
  const t = gl.createTexture()!

  // temporarly use single pixel texture while texture image loads
  wglu.bindSinglePixelTexture(gl, t, singlePixelColor)

  // actual texture image
  if (imgSrc) {
    const image = new Image()
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      // mipmap only works on inages of dimension base 2
      gl.generateMipmap(gl.TEXTURE_2D)

      // use nearest neighbor for zooming in
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

      // use mipmap trilinear filtering for zoomed out
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

      // use repeat to make the texture repeat in both the s and t directions
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    }
    image.src = imgSrc
  }
  gl.bindTexture(gl.TEXTURE_2D, null) // unbind texture

  return t
}

function quad(
  vertices: Vec[],
  vertexOrder: number[],
  normalVector: Vec,
  points: Vec[],
  normals: Vec[],
  uvs: Vec[],
) {
  // Add the vertices that specify the triangular pieces to make
  // the cube face
  points.push(vertices[vertexOrder[0]!]!)
  points.push(vertices[vertexOrder[2]!]!)
  points.push(vertices[vertexOrder[3]!]!)
  points.push(vertices[vertexOrder[0]!]!)
  points.push(vertices[vertexOrder[3]!]!)
  points.push(vertices[vertexOrder[1]!]!)

  // All six points of each cube side will and should have the
  // same normal vector
  Array(6)
    .fill(normalVector)
    .forEach(function (n) {
      normals.push(n)
    })

  // Fill the uv array for mapping the texture to the surface
  uvs.push(mv.vec2(1, 0))
  uvs.push(mv.vec2(0, 0))
  uvs.push(mv.vec2(0, 1))
  uvs.push(mv.vec2(1, 0))
  uvs.push(mv.vec2(0, 1))
  uvs.push(mv.vec2(1, 1))
}

function generateData(sz: number) {
  // 3d coordinates that represent eight corners of a cube
  const verts = [
    mv.vec3(sz, sz, sz),
    mv.vec3(sz, -sz, sz),
    mv.vec3(-sz, sz, sz),
    mv.vec3(-sz, -sz, sz),
    mv.vec3(sz, sz, -sz),
    mv.vec3(sz, -sz, -sz),
    mv.vec3(-sz, sz, -sz),
    mv.vec3(-sz, -sz, -sz),
  ]

  // Each face is made up of 4 vertices. The orientation of a mapped
  // texture will depend onthe order that the vertices are specified
  const vo = [
    [0, 1, 2, 3],
    [4, 0, 6, 2],
    [4, 5, 0, 1],
    [2, 3, 6, 7],
    [6, 7, 4, 5],
    [1, 5, 3, 7],
  ]

  // THe 6 different normal vectors for each face of the cube
  const ns = [
    mv.vec3(0, 0, 1),
    mv.vec3(0, 1, 0),
    mv.vec3(1, 0, 0),
    mv.vec3(-1, 0, 0),
    mv.vec3(0, 0, -1),
    mv.vec3(0, -1, 0),
  ]

  const d = dat
  for (let i = 0; i < 6; i++) {
    quad(verts, vo[i]!, ns[i]!, d.pos, d.norm, d.uv)
  }
}

function configureWebGL() {
  ;[gl, p] = wglu.baseWebGL(
    'gl-canvas',
    'vertex-shader',
    'fragment-shader',
    [0.235, 0.482, 0.827, 1],
  )

  // Set up textures we will be using
  av.textures.push(createTexture(gl, webglChrome))
  av.textures.push(createTexture(gl, webglFf7))
  av.textures.push(createTexture(gl, webglBark))
  av.floorTexture = createTexture(gl, webglGround)

  // Set Up Buffers
  buf.pos = wglu.buffer(gl, dat.pos)
  buf.norm = wglu.buffer(gl, dat.norm)
  buf.uv = wglu.buffer(gl, dat.uv)

  // Set up Attributes
  loc.a.pos = wglu.attrib(gl, p, 'vPos', 3, buf.pos)
  loc.a.norm = wglu.attrib(gl, p, 'vNorm', 3, buf.norm)
  loc.a.uv = wglu.attrib(gl, p, 'vUV', 2, buf.uv)

  // Set up Uniform Locations
  for (const uName of Object.keys(loc.u)) {
    loc.u[uName] = gl.getUniformLocation(p, uName)
  }

  // Constant Uniforms
  gl.uniform3fv(loc.u.lPos, mv.flatten(val.lPos))
}

function renderCube(
  dz: number,
  deg: number,
  axis: Vec,
  tScale: number,
  tRotMat: Mat,
  tTransVal: number,
) {
  const mMat = mv.mult(
    mv.translationMatrix(mv.vec3(0, 0, dz)),
    mv.rotationMatrix(av.cubeRotTimer.getTimeSec() * deg, axis),
  ) as Mat
  gl.uniformMatrix4fv(loc.u.mMat, false, mv.flatten(mMat))

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, av.textures[av.textureIndex]!)
  gl.uniform1i(loc.u.uSampler, 0)

  gl.uniform1f(loc.u.texS, tScale)
  gl.uniformMatrix2fv(loc.u.texR, false, mv.flatten(tRotMat))
  gl.uniform1f(loc.u.texT, tTransVal)

  gl.uniform1f(loc.u.shininess, val.shininess)

  gl.drawArrays(gl.TRIANGLES, 0, 36)
}

function renderFloorCube() {
  const mMat = mv.mult(
    mv.scalarMatrix(1000, 0.1, 1000),
    mv.translationMatrix(mv.vec3(0, -10, 0)),
  ) as Mat
  gl.uniformMatrix4fv(loc.u.mMat, false, mv.flatten(mMat))

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, av.floorTexture)
  gl.uniform1i(loc.u.uSampler, 0)

  gl.uniform1f(loc.u.texS, 500)
  gl.uniformMatrix2fv(loc.u.texR, false, mv.flatten(mv.mat2()))
  gl.uniform1f(loc.u.texT, 0)

  gl.uniform1f(loc.u.shininess, 0.0)

  gl.drawArrays(gl.TRIANGLES, 0, 36)
}

let render: () => void = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Action Updates
  wglu.executeActions(cameraCtrls.move!, av)
  wglu.executeActions(cameraCtrls.look!, av)
  wglu.executeActions(actionCtrls, av)

  // Take into account camera
  const vMat = wglc.viewMatrix(av.camera)
  const pMat = wglc.perspectiveMatrix(av.camera)
  gl.uniformMatrix4fv(loc.u.vMat, false, mv.flatten(vMat))
  gl.uniformMatrix4fv(loc.u.pMat, false, mv.flatten(pMat))

  // Now Render Each Cube
  renderCube(0.75, 360, [0, 1, 0], 1, mv.rotationMatrix2d(av.texRotTimer.getTimeSec() * 360), 0.0)
  renderCube(-0.75, 180, [1, 0, 0], 2, mv.mat2(), (av.texScrTimer.getTimeSec() % 2) - 1)
  renderFloorCube()

  wglu.requestAnimFrame()(render)
}

onMounted(() => {
  // Initialize data then webgl
  generateData(0.5)
  wglu.injectShaderScript('vertex-shader', 'x-shader/x-vertex', vertexShaderSrc)
  wglu.injectShaderScript('fragment-shader', 'x-shader/x-fragment', fragmentShaderSrc)
  configureWebGL()

  // Invert the conrtols and the keybinding for simple character lookups
  invCameraCtrls = {
    ...wglu.getInvertedControlObject(cameraCtrls.move!, 'move'),
    ...wglu.getInvertedControlObject(cameraCtrls.look!, 'look'),
  }
  invActionCtrls = wglu.getInvertedControlObject(actionCtrls)

  // Define Keyboard listeners
  window.addEventListener('keydown', (e) => {
    const ch = String.fromCharCode(e.keyCode).toLowerCase()
    if (ch in invActionCtrls) {
      actionCtrls[invActionCtrls[ch]![0]!]!.updateFlag = true
    }
    if (ch in invCameraCtrls) {
      const invCC = invCameraCtrls[ch]!
      cameraCtrls[invCC[0]!]![invCC[1]!]!.updateFlag = true
    }
  })
  window.addEventListener('keyup', (e) => {
    const ch = String.fromCharCode(e.keyCode).toLowerCase()
    if (ch in invActionCtrls) {
      actionCtrls[invActionCtrls[ch]![0]!]!.updateFlag = false
    }
    if (ch in invCameraCtrls) {
      const invCC = invCameraCtrls[ch]!
      cameraCtrls[invCC[0]!]![invCC[1]!]!.updateFlag = false
    }
  })

  // Start Render loop
  render()
})

onUnmounted(() => {
  render = () => {}
  wglu.removeShaderScript('vertex-shader')
  wglu.removeShaderScript('fragment-shader')
})
</script>
