<template>
  <div id="finite-volume">
    <h2>2 Dimensional Flow in Supersonic Jet Inlet</h2>
    <div class="blk-container">
      <img src="../assets/img/mach1x.png" />
      <div class="blk">
        <p>
          This is a computational project I completed durring my Masters program
          at UCLA in the class "250D: Computational Aerodynamics." I developed a
          two dimensional finite volume solver for a supersonic jet inlet.
          MacCormacks Method with artificial dissipation was utilized. Please
          view the
          <a href="pdf/2d-supersonic-jet-inlet-presentation.pdf"
            >presentation</a
          >
          , the
          <a href="pdf/2d-supersonic-jet-inlet-report.pdf">full report</a> and
          checkout the source code on my github page to see the awesomeness.
          This project was done using MATLAB R2015a Student Version. The
          following figure is sample of the results section showing how the mach
          number drops abruptly across the oblique shocks. These oblique shocks
          are used intentionaly in jet engine inlets to slow down supersonic
          air.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$nav-txt: #9dad7f;
#finite-volume {
  color: $nav-txt;
  text-align: center;
  .blk-container {
    display: inline-block;
    max-width: 850px;
    .blk {
      text-align: left;
    }
    img {
      margin-top: 1em;
      max-width: 90%;
    }
  }
}
</style>
