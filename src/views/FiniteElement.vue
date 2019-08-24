<template>
  <div id="finite-element">
    <h2>Finite Element Numerical Solver</h2>
    <div class="blk-container">
      <p class="blk">
        A computational solver was developed for non-linear membranes
        (neo-hookean) under plane stress conditions. Membrane theory, plane
        stress condition, and the neohookean constitutive laws constitute the
        applied mathematics while the algorithms themselves were written in
        MATLAB R2015a Student Version. The final report can be viewed
        <a href="pdf/finite-element.pdf">here</a> and source code can be viewed
        on
        <a href="https://github.com/vasko6d/finite-element-solver">GitHub</a>
        The developed code was tested on several geometries, some sample meshes
        and results are shown below.
      </p>

      <div style="text-align: center;">
        <h3>Spherical Mesh</h3>
        <img src="../assets/img/mesh10.png" />
        <h3>Spherical Membrane Under Uniform Internal Pressure</h3>
        <img src="../assets/img/ball3-quad-f2.png" />
        <h3>Flat Plate Under Uniform Downward Load</h3>
        <img src="../assets/img/ml4x-quad-iso.png" />
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$nav-txt: #9dad7f;
#finite-element {
  color: $nav-txt;
  text-align: center;
  .blk-container {
    display: inline-block;
    max-width: 850px;
    .blk {
      text-align: left;
      margin-bottom: 1em;
    }
    img {
      margin-top: 1em;
      margin-bottom: 1em;
      max-width: 90%;
    }
  }
}
</style>
