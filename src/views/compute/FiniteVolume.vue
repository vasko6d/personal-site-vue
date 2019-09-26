<template>
  <div id="finite-volume">
    <div class="blk-container">
      <p>
        I developed a two dimensional finite volume solver for a supersonic jet
        inlet. MacCormacks Method with artificial dissipation was utilized.
        Please view the
        <a href="pdf/2d-supersonic-jet-inlet-presentation.pdf">presentation</a>
        , the
        <a href="pdf/2d-supersonic-jet-inlet-report.pdf">full report,</a> and
        checkout the source code on my GitHub page to see the awesomeness. This
        project was done using MATLAB R2015a Student Version. The below figure
        is a sample of the results section showing how the mach number drops
        abruptly across the oblique shocks. These oblique shocks are used
        intentionaly in jet engine inlets to slow down supersonic air.
      </p>
      <h3>Sample Results</h3>
      <img src="@/assets/img/mach1x.png" />
    </div>
  </div>
</template>
