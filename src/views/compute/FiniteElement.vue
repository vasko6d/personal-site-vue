<template>
  <div id="finite-element">
    <div class="blk-container">
      <p class="ind-p">
        A computational solver was developed for non-linear membranes
        (neo-hookean) under plane stress conditions. Membrane theory, plane
        stress condition, and the neohookean constitutive laws represent the
        applied mathematics while the algorithms themselves were written in
        MATLAB R2015a Student Version. Please take a deepr look at the
        <a class="icn b" href="/pdf/finite-element.pdf">Final Report</a> as well
        as the source code which can be viewed on
        <a class="icn b" href="https://github.com/vasko6d/finite-element-solver"
          >GitHub</a
        >. The developed code was tested on several geometries, some sample
        meshes and results are shown below.
      </p>

      <h3>Spherical Mesh</h3>
      <img src="@/assets/img/mesh10.png" />
      <h3>Spherical Membrane Under Uniform Internal Pressure</h3>
      <img src="@/assets/img/ball3-quad-f2.png" />
      <h3>Flat Plate Under Uniform Downward Load</h3>
      <img src="@/assets/img/ml4x-quad-iso.png" />
    </div>
  </div>
</template>
