import Timer from '@/utils/webgl/Timer'
import Planet, { type Light, type Material, type Orbit } from './Planet'
import * as mv from '@/utils/webgl/MatrixMath'
import type { Vec } from '@/utils/webgl/MatrixMath'

export interface SeedPoints {
  a: Vec
  b: Vec
  c: Vec
  d: Vec
}

interface ComplexityVertexMap {
  [complexity: number]: { offset: number; len: number }
}

export default class Galaxy {
  /**
   * Galaxy is a helper class for creating all the data points
   * associated wtih a "galaxy"
   * @constructor
   */
  vertices: Vec[]
  normals: Vec[]
  flatNormals: Vec[]
  planets: Planet[]
  lightSource: Light
  seedPoints: SeedPoints
  timer: Timer
  complexityVertexMap: ComplexityVertexMap

  constructor(
    lightSource: Light,
    seedPoints: SeedPoints,
    minComplexity: number,
    maxComplexity: number,
  ) {
    this.vertices = []
    this.normals = []
    this.flatNormals = []
    this.planets = []
    this.lightSource = lightSource
    this.seedPoints = seedPoints
    this.timer = new Timer()
    this.complexityVertexMap = {}
    this.generateTetrahedrans(minComplexity, maxComplexity)
  }

  getVertices(): Vec[] {
    return this.vertices
  }

  getNormals(): Vec[] {
    return this.normals
  }

  getFlatNormals(): Vec[] {
    return this.flatNormals
  }

  getPlanetByIndex(idx: number): Planet {
    return this.planets[idx]!
  }

  clearPlanets() {
    this.planets = []
  }

  addPlanet(complexity: number, size: number, material: Material, orbit: Orbit, name?: string) {
    this.planets.push(
      new Planet(size, material, orbit, this.complexityVertexMap[complexity]!, name),
    )
  }

  generateTetrahedrans(minComplexity: number, maxComplexity: number) {
    for (let c = minComplexity; c <= maxComplexity; c++) {
      const offset = this.vertices.length
      this.tetrahedron(this.seedPoints, c)
      const len = this.vertices.length - offset
      this.complexityVertexMap[c] = {
        offset: offset,
        len: len,
      }
    }
  }

  addMoon(
    planetIndexPath: number[],
    complexity: number,
    size: number,
    material: Material,
    orbit: Orbit,
    name?: string,
  ) {
    let p = this.getPlanetByIndex(planetIndexPath[0]!)
    for (let i = 1; i < planetIndexPath.length; i++) {
      p = p.getMoonByIndex(planetIndexPath[i]!)
    }
    p.moons.push(
      new Planet(size / p.size, material, orbit, this.complexityVertexMap[complexity]!, name),
    )
  }

  animatePlanets(gl: WebGLRenderingContext, loc: Parameters<Planet['animate']>[1]) {
    // NOTE: this assumes that the buffer data has already been bound
    const ls = this.lightSource
    const time = this.timer.getTimeSec()
    this.planets.forEach((planet) => {
      planet.animate(gl, loc, ls, time)
    })
  }

  /**
   * Push the vertex data of a triangle onto the appropriate arrys
   */
  pushTriangle(a: Vec, b: Vec, c: Vec) {
    this.normals.push(a)
    this.normals.push(b)
    this.normals.push(c)

    this.flatNormals.push(a)
    this.flatNormals.push(a)
    this.flatNormals.push(a)

    this.vertices.push(a)
    this.vertices.push(b)
    this.vertices.push(c)
  }

  divideTriangle(a: Vec, b: Vec, c: Vec, count: number) {
    if (count > 0) {
      let ab = mv.mix(a, b, 0.5)
      let ac = mv.mix(a, c, 0.5)
      let bc = mv.mix(b, c, 0.5)

      ab = mv.normalize(ab, false)
      ac = mv.normalize(ac, false)
      bc = mv.normalize(bc, false)

      this.divideTriangle(a, ab, ac, count - 1)
      this.divideTriangle(ab, b, bc, count - 1)
      this.divideTriangle(bc, c, ac, count - 1)
      this.divideTriangle(ab, bc, ac, count - 1)
    } else {
      this.pushTriangle(a, b, c)
    }
  }

  tetrahedron(sp: SeedPoints, n: number) {
    this.divideTriangle(sp.a, sp.b, sp.c, n)
    this.divideTriangle(sp.d, sp.c, sp.b, n)
    this.divideTriangle(sp.a, sp.d, sp.b, n)
    this.divideTriangle(sp.a, sp.c, sp.d, n)
  }

  /**
   * Return the Shader flag used to determine the type of shading
   */
  getShadingFlag(shadingType: string): number {
    switch (shadingType.toLowerCase()) {
      case 'flat':
        return 0
      case 'gourand':
        return 1
      case 'phong':
        return 2
      default:
        throw 'INVALID SHADING TYPE [' + shadingType + ']'
    }
  }

  getTimer(): Timer {
    return this.timer
  }
}
