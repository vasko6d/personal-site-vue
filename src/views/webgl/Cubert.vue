<template>
  <div id="cubert">
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
import type { BufferIndexer } from '@/utils/webgl/WebGLUtils'
import WebglCamera from '@/components/webgl/WebglCamera.vue'
import ActionControls from '@/components/webgl/ActionControls.vue'
import Timer from '@/utils/webgl/Timer'
import type { ActionCtrlMap, CameraCtrlMap, Camera } from '@/utils/webgl/types'

const vertexShaderSrc = `
  attribute  vec3 vPos;
  uniform mat4 mMat;
  uniform mat4 vMat;
  uniform mat4 pMat;
  void main()
  {
      gl_Position = pMat * vMat * mMat * vec4(vPos, 1);
  }
`
const fragmentShaderSrc = `
  precision mediump float;
  uniform vec4 color;
  void main()
  {
      gl_FragColor = color;
  }
`

interface CubeScalar {
  mag: number | number[]
  sinMag: number | number[]
  omega: number | number[]
  phase: number | number[]
}
interface CubeRotation {
  omega: number
  axis: number[]
}
interface Cube {
  position: Vec
  scalar: CubeScalar
  rotation?: CubeRotation
}

interface Av {
  timer: Timer
  cIndex: number
  showCrosshair: boolean
  camera: Camera
  cubes: Cube[]
  numInitialCubes: number
}

function cube(
  position: number[],
  scalarValues: false | (number | number[])[],
  rotationValues: false | [number, number[]],
): Cube {
  // Cube object has a position and optionaly a scaling object and a rotation object
  const c: Cube = {
    position: mv.vec3(position),
    scalar: {
      // defaults
      mag: 1,
      sinMag: 0,
      omega: 0,
      phase: 0,
    },
  }

  // Set up Scalar Object if values were passed
  // * uniform scaling defined by equation: mag (1 + sinMag * Sin( omega * time + phase)
  // * Each value can be a single number for uniform scalaing in each direction or an array of 3
  if (scalarValues) {
    c.scalar.mag = scalarValues[0]!
    if (Array.isArray(c.scalar.mag)) {
      c.scalar.sinMag = [0, 0, 0]
      c.scalar.omega = [0, 0, 0]
      c.scalar.phase = [0, 0, 0]
    }
    if (scalarValues.length > 1) {
      c.scalar.sinMag = scalarValues[1]!
      if (scalarValues.length > 2) {
        c.scalar.omega = scalarValues[2]!
        if (scalarValues.length > 3) {
          c.scalar.phase = scalarValues[3]!
        }
      }
    }
  }

  // Set up rotation object if values were passed
  // * simple rotation about an axis with speed omega.
  if (rotationValues) {
    c.rotation = {
      omega: rotationValues[0],
      axis: rotationValues[1],
    }
  }
  return c
}

// Web Gl Variables
let gl: WebGLRenderingContext // [g]raphics [l]ibrary
let p: WebGLProgram // Shader [p]rogram

interface UniformLocs {
  pMat: WebGLUniformLocation | null // projection matrix
  vMat: WebGLUniformLocation | null // view matrix
  mMat: WebGLUniformLocation | null // model matrix
  color: WebGLUniformLocation | null // RGBA color for the shape
  [key: string]: WebGLUniformLocation | null
}

// Location to the variables used in the shader programs
const loc = {
  // Uniforms
  u: {
    pMat: null,
    vMat: null,
    mMat: null,
    color: null,
  } as UniformLocs,
  // Attributes
  a: {
    pos: 0, // Position (declared, unused - vPos is what actually gets set below)
    vPos: 0,
  },
}

// Buffer Data
const buf: { pos: WebGLBuffer | null } = { pos: null }
const dat: { pos: Vec[] } = { pos: [] }
const bufIdx: BufferIndexer = {
  lastEnd: 0,
}

// Data Variables
const color: Vec[] = [
  mv.vec4(0.3, 0.3, 0.3, 1.0), // grey
  mv.vec4(1.0, 0.0, 0.0, 1.0), // red
  mv.vec4(1.0, 1.0, 0.0, 1.0), // yellow
  mv.vec4(0.0, 1.0, 0.0, 1.0), // green
  mv.vec4(0.0, 0.0, 1.0, 1.0), // blue
  mv.vec4(1.0, 0.0, 1.0, 1.0), // magenta
  mv.vec4(0.0, 1.0, 1.0, 1.0), // cyan
  mv.vec4(1.0, 1.0, 1.0, 1.0), // white
  mv.vec4(0.803, 0.592, 0.278), // brown
]
const crosshair = {
  near: -15,
  far: 15,
  left: -15.0,
  right: 15.0,
  top: 15.0,
  bottom: -15.0,
}

// [A]ction affected [V]ariables
const av: Av = reactive({
  timer: new Timer(true),
  cIndex: 0,
  showCrosshair: false,
  camera: wglc.initCamera({
    position: mv.vec3(-30, 0, 0),
    far: 1000,
  }),
  cubes: [
    cube([10, -10, -10], [1, 0.5, 5, 0.855], false),
    cube([10, -10, 10], [1, 0.7, 2, 0.855], false),
    cube([10, 10, -10], false, [2, [1, 0, 0]]),
    cube([10, 10, 10], false, [5, [0, 1, 0]]),
    cube([-10, -10, -10], false, [1, [0, 0, 1]]),
    cube([-10, -10, 10], false, [4, [1, 1, 1]]),
    cube([-10, 10, -10], [1, 0.5, 2.5, 5.12], false),
    cube([-10, 10, 10], [1, 0.25, 5, 5.98], false),
    cube([0, -12, 0], [[1000, 0.1, 1000]], false), // floor "cube"
    cube([50, -10, 50], false, false),
    cube([-50, -10, 50], false, false),
    cube([50, -10, -50], false, false),
    cube([-50, -10, -50], false, false),
    cube([100, -10, 100], false, false),
    cube([-100, -10, 100], false, false),
    cube([100, -10, -100], false, false),
    cube([-100, -10, -100], false, false),
    cube([50, 10, 50], false, false),
    cube([-50, 10, 50], false, false),
    cube([50, 10, -50], false, false),
    cube([-50, 10, -50], false, false),
    cube([100, 10, 100], false, false),
    cube([-100, 10, 100], false, false),
    cube([100, 10, -100], false, false),
    cube([-100, 10, -100], false, false),
    cube([500, 60, 0], [10, 1, 1, 4.3], [2, [-1, -1, -1]]),
  ],
  numInitialCubes: 0,
})

// Camera Keybind variables
const cameraCtrls: CameraCtrlMap<Av> = reactive(
  wglc.defaultControls() as unknown as CameraCtrlMap<Av>,
)
let invCameraCtrls: Record<string, string[]> = {} // initialize during mount

// Other Keybind Variables
const actionCtrls = reactive<ActionCtrlMap<Av>>({
  toggleChrosshair: {
    keybind: 'r',
    icon: 'fas fa-crosshairs',
    desc: 'Toggle Crosshair On/Off',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.showCrosshair = !av.showCrosshair
    },
  },
  goToStart: {
    keybind: 't',
    icon: 'fas fa-map-marked',
    desc: 'Warp to starting position',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.camera = wglc.initCamera(av.camera.initialProps)
    },
  },
  toggleTime: {
    keybind: 'p',
    icon: 'fas fa-pause',
    desc: 'Stop/start the rotation/scaling of cubes',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.timer.toggleTimer()
    },
  },
  changeColor: {
    keybind: 'f',
    icon: 'fas fa-palette',
    desc: 'Change Color of Cubes',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.cIndex = (av.cIndex + 1) % 8
    },
  },
  addCube: {
    keybind: 'g',
    icon: 'fas fa-plus',
    desc: 'Add new cube infront of current view',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: (av) => {
      const newCubePos = mv.add(
        av.camera.position,
        mv.scale(10, wglc.atVector(av.camera)) as Vec,
      ) as Vec
      av.cubes.push(cube(newCubePos, false, false))
    },
  },
  revert: {
    keybind: 'z',
    icon: 'fas fa-trash',
    desc: 'Revert to Original State, disregarding changes',
    holdable: false,
    framesActive: 0,
    updateFlag: false,
    updateFxn: function (av) {
      av.camera = wglc.initCamera(av.camera.initialProps)
      av.cIndex = 0
      av.showCrosshair = false
      av.timer.reset()
      av.timer.resume()
      av.cubes = av.cubes.slice(0, av.numInitialCubes)
    },
  },
})
let invActionCtrls: Record<string, string[]> = {} // initialize during mount

function generateCubeVertices(sz = 1) {
  // Ideal Triangle Strip: 3 2 6 7 4 2 0 3 1 6 5 4 1 0
  // --> 14 is the minimum numbers of points to define a cube with triangles.
  const verts = [
    mv.vec3(sz, -sz, sz), // 0
    mv.vec3(-sz, -sz, sz), // 1
    mv.vec3(sz, -sz, -sz), // 2
    mv.vec3(-sz, -sz, -sz), // 3
    mv.vec3(sz, sz, sz), // 4
    mv.vec3(-sz, sz, sz), // 5
    mv.vec3(-sz, sz, -sz), // 6
    mv.vec3(sz, sz, -sz), // 7
  ]

  // stripArray has all the vertices of a cube in the correct order to use just 1 triangle strip
  const stripArray: Vec[] = []
  stripArray.push(verts[3]!)
  stripArray.push(verts[2]!)
  stripArray.push(verts[6]!)
  stripArray.push(verts[7]!)
  stripArray.push(verts[4]!)
  stripArray.push(verts[2]!)
  stripArray.push(verts[0]!)
  stripArray.push(verts[3]!)
  stripArray.push(verts[1]!)
  stripArray.push(verts[6]!)
  stripArray.push(verts[5]!)
  stripArray.push(verts[4]!)
  stripArray.push(verts[1]!)
  stripArray.push(verts[0]!)

  // Add strip array to our data object and add entry to buffer index
  Array.prototype.push.apply(dat.pos, stripArray)
  wglu.updateBufferIndex(bufIdx, 'cube', stripArray.length)
}

function generateCrosshairVertices(stepSize: number) {
  // First add points that make a circle.
  let verts: Vec[] = []
  for (let alpha = 0; alpha < 6.28; alpha = alpha + stepSize) {
    verts.push(mv.vec3(5 * Math.cos(alpha), 5 * Math.sin(alpha), 14.9))
  }
  Array.prototype.push.apply(dat.pos, verts)
  wglu.updateBufferIndex(bufIdx, 'circle', verts.length)

  // now add plus sign to complete crosshair
  verts = []
  verts.push(mv.vec3(7, 0, 14.9))
  verts.push(mv.vec3(-7, 0, 14.9))
  verts.push(mv.vec3(0, 7, 14.9))
  verts.push(mv.vec3(0, -7, 14.9))
  Array.prototype.push.apply(dat.pos, verts)
  wglu.updateBufferIndex(bufIdx, 'plus', verts.length)
}

function sclEqn(mag: number, sinMag: number, omega: number, phase: number): number {
  return mag * (1 + sinMag * Math.sin(av.timer.getTimeSec() * omega + phase))
}

function cubeScaleMatrix(s: CubeScalar): Mat {
  if (Array.isArray(s.mag)) {
    const sinMag = s.sinMag as number[]
    const omega = s.omega as number[]
    const phase = s.phase as number[]
    return mv.scalarMatrix(
      sclEqn(s.mag[0]!, sinMag[0]!, omega[0]!, phase[0]!),
      sclEqn(s.mag[1]!, sinMag[1]!, omega[1]!, phase[1]!),
      sclEqn(s.mag[2]!, sinMag[2]!, omega[2]!, phase[2]!),
    )
  } else {
    return mv.scalarMatrix(sclEqn(s.mag, s.sinMag as number, s.omega as number, s.phase as number))
  }
}

function configureWebGL() {
  ;[gl, p] = wglu.baseWebGL(
    'gl-canvas',
    'vertex-shader',
    'fragment-shader',
    [0.235, 0.482, 0.827, 1],
  )

  // Set Up Buffers
  buf.pos = wglu.buffer(gl, dat.pos)

  // Set up Shader Variables
  loc.a.vPos = wglu.attrib(gl, p, 'vPos', 3, buf.pos)

  // Set up Uniform Locations
  for (const uName of Object.keys(loc.u)) {
    loc.u[uName] = gl.getUniformLocation(p, uName)
  }
}

function renderCube(num: number) {
  // Set the Cube Color
  const ci = (num + av.cIndex) % color.length
  const c = color[ci]!
  gl.uniform4f(loc.u.color, c[0]!, c[1]!, c[2]!, c[3]!)

  // Individually transalte and optionally Scale/Rotate each Cube
  const cubert = av.cubes[num]!
  const t = mv.translationMatrix(cubert.position)
  let sr = cubeScaleMatrix(cubert.scalar)
  if (cubert.rotation) {
    sr = mv.mult(
      sr,
      mv.rotationMatrix(
        mv.deg(av.timer.getTimeSec()) * cubert.rotation.omega,
        cubert.rotation.axis,
      ),
    ) as Mat
  }
  const mMat = mv.mult(t, sr) as Mat

  // Actually set the WebGl values
  gl.uniformMatrix4fv(loc.u.mMat, false, mv.flatten(mMat))
  wglu.draw(gl, gl.TRIANGLE_STRIP, bufIdx, 'cube')
}

function renderCrosshair() {
  if (av.showCrosshair) {
    // color is Red
    const c = color[1]!
    gl.uniform4f(loc.u.color, c[0]!, c[1]!, c[2]!, c[3]!)
    gl.uniformMatrix4fv(loc.u.vMat, false, mv.flatten(mv.mat4()))
    gl.uniformMatrix4fv(loc.u.mMat, false, mv.flatten(mv.mat4()))
    gl.uniformMatrix4fv(
      loc.u.pMat,
      false,
      mv.flatten(
        mv.ortho(
          crosshair.left,
          crosshair.right,
          crosshair.bottom,
          crosshair.top,
          crosshair.near,
          crosshair.far,
        ),
      ),
    )
    wglu.draw(gl, gl.LINE_LOOP, bufIdx, 'circle')
    wglu.draw(gl, gl.LINES, bufIdx, 'plus')
  }
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

  for (let i = 0; i < av.cubes.length; ++i) {
    renderCube(i)
  }
  renderCrosshair() // Crosshair has no view or model transofrmations

  wglu.requestAnimFrame()(render)
}

onMounted(() => {
  // Generate Vetex Dat and set up web gl
  generateCubeVertices()
  generateCrosshairVertices(0.1)
  av.numInitialCubes = av.cubes.length
  wglu.injectShaderScript('vertex-shader', 'x-shader/x-vertex', vertexShaderSrc)
  wglu.injectShaderScript('fragment-shader', 'x-shader/x-fragment', fragmentShaderSrc)
  configureWebGL()

  // Set up the inverted controls adn window events
  invCameraCtrls = {
    ...wglu.getInvertedControlObject(cameraCtrls.move!, 'move'),
    ...wglu.getInvertedControlObject(cameraCtrls.look!, 'look'),
  }
  invActionCtrls = wglu.getInvertedControlObject(actionCtrls)
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

  // begin render loop
  render()
})

onUnmounted(() => {
  render = () => {}
  wglu.removeShaderScript('vertex-shader')
  wglu.removeShaderScript('fragment-shader')
})
</script>
