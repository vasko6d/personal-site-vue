import Timer from "@/mixins/webgl/Timer.js";
import Planet from "./Planet.js";
import WebGLUtils from "@/mixins/webgl/WebGLUtils.vue";
var wglu = WebGLUtils.methods;
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
var mv = MatrixMath.methods;

export default class Galaxy {
  /**
   * Galaxy is a helper class for creating all the data points
   * associated wtih a "galaxy"
   * @constructor
   */
  constructor(lightSource, seedPoints, minComplexity, maxComplexity) {
    this.vertices = [];
    this.normals = [];
    this.flatNormals = [];
    this.planets = [];
    this.lightSource = lightSource;
    this.seedPoints = seedPoints;
    this.timer = new Timer();
    this.complexityVertexMap = {};
    this.generateTetrahedrans(minComplexity, maxComplexity);
  }

  getVertices() {
    return this.vertices;
  }

  getNormals() {
    return this.normals;
  }

  getFlatNormals() {
    return this.flatNormals;
  }

  getPlanetByIndex(idx) {
    return this.planets[idx];
  }

  clearPlanets() {
    this.planets = [];
  }

  addPlanet(complexity, size, material, orbit) {
    this.planets.push(
      new Planet(size, material, orbit, this.complexityVertexMap[complexity])
    );
  }

  generateTetrahedrans(minComplexity, maxComplexity) {
    for (let c = minComplexity; c <= maxComplexity; c++) {
      let offset = this.vertices.length;
      this.tetrahedron(this.seedPoints, c);
      let len = this.vertices.length - offset;
      this.complexityVertexMap[c] = {
        offset: offset,
        len: len
      };
    }
  }

  addMoon(planetIndexPath, complexity, size, material, orbit) {
    var p = this.getPlanetByIndex(planetIndexPath[0]);
    for (let i = 1; i < planetIndexPath.length; i++) {
      p = p.getMoonByIndex(planetIndexPath[i]);
    }
    p.moons.push(
      new Planet(
        size / p.size,
        material,
        orbit,
        this.complexityVertexMap[complexity]
      )
    );
  }

  rebindBufferData(gl, loc, buf) {
    // rebind data to the buffers
    wglu.rebuffer(gl, this.getVertices(), buf.pos);
    wglu.rebuffer(gl, this.getNormals(), buf.norm);
    wglu.rebuffer(gl, this.getFlatNormals(), buf.flatNorm);

    // Set up Attributes
    wglu.attrib(gl, loc.a.pos, 3, buf.pos);
    wglu.attrib(gl, loc.a.norm, 3, buf.norm);
    wglu.attrib(gl, loc.a.flatNorm, 3, buf.flatNorm);
  }

  animatePlanets(gl, loc) {
    // NOTE: this assumes that the buffer data has already been bound
    var ls = this.lightSource;
    var time = this.timer.getTimeSec();
    this.planets.forEach(function(planet) {
      planet.animate(gl, loc, ls, time);
    });
  }

  /**
   * Push the vertex data of a triangle onto the appropriate arrys
   * @param {*} a vertex 1 of triangle
   * @param {*} b vertex 2 of triange
   * @param {*} c vertex 3 of triangle
   */
  pushTriangle(a, b, c) {
    this.normals.push(a);
    this.normals.push(b);
    this.normals.push(c);

    this.flatNormals.push(a);
    this.flatNormals.push(a);
    this.flatNormals.push(a);

    this.vertices.push(a);
    this.vertices.push(b);
    this.vertices.push(c);
  }
  /**
   *
   * @param {*} a
   * @param {*} b
   * @param {*} c
   * @param {*} count
   */
  divideTriangle(a, b, c, count) {
    if (count > 0) {
      var ab = mv.mix(a, b, 0.5);
      var ac = mv.mix(a, c, 0.5);
      var bc = mv.mix(b, c, 0.5);

      ab = mv.normalize(ab, false);
      ac = mv.normalize(ac, false);
      bc = mv.normalize(bc, false);

      this.divideTriangle(a, ab, ac, count - 1);
      this.divideTriangle(ab, b, bc, count - 1);
      this.divideTriangle(bc, c, ac, count - 1);
      this.divideTriangle(ab, bc, ac, count - 1);
    } else {
      this.pushTriangle(a, b, c);
    }
  }
  /**
   *
   * @param {*} a
   * @param {*} b
   * @param {*} c
   * @param {*} d
   * @param {*} n
   */
  tetrahedron(sp, n) {
    this.divideTriangle(sp.a, sp.b, sp.c, n);
    this.divideTriangle(sp.d, sp.c, sp.b, n);
    this.divideTriangle(sp.a, sp.d, sp.b, n);
    this.divideTriangle(sp.a, sp.c, sp.d, n);
  }

  /**
   * Return the Shader flag used to determine the type of shading
   * @param {String} shadingType
   */
  getShadingFlag(shadingType) {
    switch (shadingType.toLowerCase()) {
      case "flat":
        return 0;
      case "gourand":
        return 1;
      case "phong":
        return 2;
      default:
        throw "INVALID SHADING TYPE [" + shadingType + "]";
    }
  }

  getTimer() {
    return this.timer;
  }
}
