import * as mv from '@/utils/webgl/MatrixMath'
import type { Vec, Mat } from '@/utils/webgl/MatrixMath'

export interface Orbit {
  eccentricity: number
  omega: number
  phase: number
  radius: number
}

export interface Material {
  ambient: Vec
  diffuse: Vec
  specular: Vec
  shininess: number
  shading: number
}

export interface Light {
  position: Vec
  ambient: Vec
  diffuse: Vec
  specular: Vec
}

interface UniformLocations {
  u: {
    ambientProduct: WebGLUniformLocation
    diffuseProduct: WebGLUniformLocation
    specularProduct: WebGLUniformLocation
    shininess: WebGLUniformLocation
    shading: WebGLUniformLocation
    mMat: WebGLUniformLocation
    [key: string]: WebGLUniformLocation
  }
}

export default class Planet {
  size: number
  orbit: Orbit
  material: Material
  bufferIndexer: { offset: number; len: number }
  moons: Planet[]
  name: string

  constructor(
    size: number,
    material: Material,
    orbit: Orbit,
    bufferIndexer: { offset: number; len: number },
    name = 'Unknown',
  ) {
    this.size = size
    this.orbit = orbit
    this.material = material
    this.bufferIndexer = bufferIndexer
    this.moons = []
    this.name = name
  }

  translationMatrix(time: number): Mat {
    return mv.mult(
      mv.translationMatrix(this.getPosition(time)),
      mv.scalarMatrix(this.size, this.size, this.size),
    ) as Mat
  }

  getPosition(time: number): Vec {
    const rads = time * this.orbit.omega + this.orbit.phase
    return mv.vec3(
      this.orbit.eccentricity * this.orbit.radius * Math.cos(rads),
      0,
      this.orbit.radius * Math.sin(rads),
    )
  }

  getMoonByIndex(idx: number): Planet {
    return this.moons[idx]!
  }

  animate(
    gl: WebGLRenderingContext,
    loc: UniformLocations,
    light: Light,
    time: number,
    prevMat: Mat = mv.mat4(),
  ) {
    // set lighting properties for shaders
    const ambientProduct = mv.mult(light.ambient, this.material.ambient)
    const diffuseProduct = mv.mult(light.diffuse, this.material.diffuse)
    const specularProduct = mv.mult(light.specular, this.material.specular)
    gl.uniform4fv(loc.u.ambientProduct, mv.flatten(ambientProduct))
    gl.uniform4fv(loc.u.diffuseProduct, mv.flatten(diffuseProduct))
    gl.uniform4fv(loc.u.specularProduct, mv.flatten(specularProduct))
    gl.uniform1f(loc.u.shininess, this.material.shininess)
    gl.uniform1f(loc.u.shading, this.material.shading)

    // set model matrix which will position planet correctly
    const modelMatrix = mv.mult(prevMat, this.translationMatrix(time)) as Mat
    gl.uniformMatrix4fv(loc.u.mMat, false, mv.flatten(modelMatrix))
    gl.drawArrays(gl.TRIANGLES, this.bufferIndexer.offset, this.bufferIndexer.len)

    this.animateMoons(gl, loc, light, time, modelMatrix)
  }

  animateMoons(
    gl: WebGLRenderingContext,
    loc: UniformLocations,
    light: Light,
    time: number,
    prevMat: Mat,
  ) {
    this.moons.forEach((moon) => {
      moon.animate(gl, loc, light, time, prevMat)
    })
  }
}
