<template>
  <div id="billiard-ball-robot">
    <h2>Completely Autonomous Billiard Ball Robot</h2>
    <iframe
      height="240"
      width="360"
      src="https://docs.google.com/file/d/0B903aI0TyENqOGFwV2NGMFhWZnM/preview?pli=1"
      frameborder="0"
      allowfullscreen
    ></iframe>
    <div class="blk-container">
      <h3>Design Requirements:</h3>
      <ul>
        <li>Run completely autonomously</li>
        <li>Robot must have dimensions less than 1'x1'x1'</li>
        <li>In a 4' x 4' platform find a billiard ball</li>
        <li>Retrieve the billiard ball once found</li>
        <li>
          Deliver the billiard ball to a collection bin an the end of an
          inclined and ramp with three 90 degree turns
        </li>
        <li>Return to starting area</li>
      </ul>

      <h3>Design and Fabrication</h3>
      <ul>
        <li>Modeled and analyzed using Solidworks 2013</li>
        <li>Programmed using Labview</li>
        <li>Structural parts machined on ULCA student machine shop</li>
        <li>Used SB-Rio board to wire and program robot</li>
        <li>Motors controlled with Pulse Width Modulation.</li>
        <li>
          Motor controller, motors, sensors, wheels and the rack and pinion were
          all purchased from online vendors.
        </li>
      </ul>
      <br />
      <p class="ind-p">
        And finally to view the presentation we made showcasing the design
        process and what we learned click the following link.
        <a class="icn b" href="pdf/billiard-ball-robot.pdf">Mo Presentation.</a>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#billiard-ball-robot {
  .blk-container {
    width: 100%;
    max-width: 650px;
    ul {
      list-style-type: circle;
      li {
        margin-left: 5px;
      }
    }
  }
  iframe {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
    margin-bottom: 1em;
  }
}
</style>
