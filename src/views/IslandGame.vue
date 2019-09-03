<template>
  <div id="island-game">
    <h2>Island Mystery Survival</h2>
    <h4>
      Final project for CS 174A, Introduction to Computer Graphics, UCLA Fall
      2014
    </h4>
    <img src="../assets/img/island-pic.jpg" />
    <h4>
      See a demo
      <a href="http://ipetkov.github.io/IslandMysteryGame">here</a>! And see the
      source code on GitHub
      <a href="https://github.com/ipetkov/IslandMysteryGame">here</a>.
    </h4>

    <div class="blk-container">
      <h3>The object of the game is to enjoy the island. Things you can do:</h3>

      <ul>
        <li>
          Pick up branches from trees to start a fire (hint: find the firepit!)
        </li>
        <li>Relax and listen to the soothing sounds of nature</li>
        <li>Rhrow rocks</li>
        <li>Climb the mountain</li>
        <li>Explore!</li>
      </ul>
      <h3>Advanced Graphics Topics</h3>
      <ul>
        <li>Collisions</li>
        <li>Physics</li>
        <li>Bump Mapping</li>
      </ul>
      <h3>Other cool stuff:</h3>
      <ul>
        <li>
          The island is partially randomly generated. There are 4 regions:
          rolling hills, forest, bay, and mountain. Each has randomly generated
          terrain by using a height map. The trees and other objects are also
          randomly placed.
        </li>
        <li>
          There are lots of sound effects, and there is spooky music at night!
        </li>
        <li>A fire can be made from sticks found on the island</li>
        <li>A lit fire will light up the rocks that make up the fire pit</li>
        <li>
          Bumpmapping is only implemented on the trunks of the trees but an
          example cube is commeneted out in scene.js that shows a gloriously
          bumped texture
        </li>
        <li>
          If there are no branches within jumpable height you can knock them off
          the trees with rocks found on the island!
        </li>
        <li>Thrown rocks will reflect off trees in realistic ways.</li>
      </ul>
    </div>
  </div>
</template>
