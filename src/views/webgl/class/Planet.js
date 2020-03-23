import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
var mv = MatrixMath.methods;
export default class Planet {
  /**
   *
   * @param {*} size
   * @param {*} material
   * @param {*} orbit
   * @param {*} bufferIndexer
   */
  constructor(size, material, orbit, bufferIndexer, name = "Unknown") {
    this.size = size;
    this.orbit = orbit;
    this.material = material;
    this.bufferIndexer = bufferIndexer;
    this.moons = [];
    this.name = name;
  }

  /**
   *
   * @param {*} time
   */
  translationMatrix(time) {
    return mv.mult(
      mv.translationMatrix(this.getPosition(time)),
      mv.scalarMatrix(this.size, this.size, this.size)
    );
  }

  getPosition(time) {
    let rads = time * this.orbit.omega + this.orbit.phase;
    return mv.vec3(
      this.orbit.eccentricity * this.orbit.radius * Math.cos(rads),
      0,
      this.orbit.radius * Math.sin(rads)
    );
  }

  getMoonByIndex(idx) {
    return this.moons[idx];
  }

  animate(gl, loc, light, time, prevMat = mv.mat4()) {
    // set lighting properties for shaders
    var ambientProduct = mv.mult(light.ambient, this.material.ambient);
    var diffuseProduct = mv.mult(light.diffuse, this.material.diffuse);
    var specularProduct = mv.mult(light.specular, this.material.specular);
    gl.uniform4fv(loc.u.ambientProduct, mv.flatten(ambientProduct));
    gl.uniform4fv(loc.u.diffuseProduct, mv.flatten(diffuseProduct));
    gl.uniform4fv(loc.u.specularProduct, mv.flatten(specularProduct));
    gl.uniform1f(loc.u.shininess, this.material.shininess);
    gl.uniform1f(loc.u.shading, this.material.shading);

    // set model matrix which will position planet correctly
    let modelMatrix = mv.mult(prevMat, this.translationMatrix(time));
    gl.uniformMatrix4fv(loc.u.mMat, false, mv.flatten(modelMatrix));
    gl.drawArrays(
      gl.TRIANGLES,
      this.bufferIndexer.offset,
      this.bufferIndexer.len
    );

    this.animateMoons(gl, loc, light, time, modelMatrix);
  }

  animateMoons(gl, loc, light, time, prevMat) {
    this.moons.forEach(function (moon) {
      moon.animate(gl, loc, light, time, prevMat);
    });
  }
}
