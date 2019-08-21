<template>
  <div id="billiard-ball-robot">
    <h2>Completely Autonomous Billiard Ball Robot</h2>
    <p>
      For my capstone at UCLA, we were required to make a fully autonomous robot
      that could perform the following:
    </p>
    <ul>
      <li>Run completely autonomously</li>
      <li>Robot must have dimensions less than 1'x1'x1'</li>
      <li>In a 4' x 4' platform find a billiard ball</li>
      <li>Retrieve the billiard ball once found</li>
      <li>
        Deliver the billiard ball to a collection bin an the end of an inclined
        and ramp with three 90 degree turns
      </li>
      <li>Return to starting area</li>
    </ul>
    <br />
    <p>
      We called our robot "MO" and below is a video of "MO" performing
      marvellously on demonstration day.
    </p>
    <iframe
      height="240"
      width="360"
      src="https://docs.google.com/file/d/0B903aI0TyENqOGFwV2NGMFhWZnM/preview?pli=1"
      frameborder="0"
      allowfullscreen
    ></iframe>

    <h3>Design and Fabrication</h3>
    <p>The list below will give a quick snapshot of how the robot was made</p>
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
    <p>
      And finally to view the presentation we made showcasing the design process
      and what we learned click the following link.
      <a href="pdf/billiard-ball-robot.pdf">Mo Presentation.</a>
    </p>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$nav-txt: #9dad7f;
#billiard-ball-robot {
  color: $nav-txt;
  text-align: left;
  ul {
    list-style-type: circle;
    margin-left: 4em;
    li {
      text-align: left;
    }
  }

  p {
    text-align: left;
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
