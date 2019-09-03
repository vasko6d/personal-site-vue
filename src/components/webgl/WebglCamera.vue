<template>
  <div id="webgl-camera-controls">
    <div class="crtl-container">
      <div class="h-item">Camera Controls</div>
      <switch-button v-model="keybindToggle" class="main-tr"
        >Show Keyboard Binds</switch-button
      >
      <div class="udlr-group ml">
        <div class="h2-item">Move</div>
        <div
          class="u-item cbtn prm"
          v-on:click="control(controls.move.forward.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.move.forward.icon">{{
            keybindToggle ? controls.move.forward.keybind : ""
          }}</i>
        </div>
        <div
          class="d-item cbtn prm"
          v-on:click="control(controls.move.backward.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.move.backward.icon">{{
            keybindToggle ? controls.move.backward.keybind : ""
          }}</i>
        </div>
        <div
          class="l-item cbtn prm"
          v-on:click="control(controls.move.left.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.move.left.icon">{{
            keybindToggle ? controls.move.left.keybind : ""
          }}</i>
        </div>
        <div
          class="r-item cbtn prm"
          v-on:click="control(controls.move.right.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.move.right.icon">{{
            keybindToggle ? controls.move.right.keybind : ""
          }}</i>
        </div>
        <div
          class="ul-item cbtn scnd"
          v-on:click="control(controls.move.up.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.move.up.icon">{{
            keybindToggle ? controls.move.up.keybind : ""
          }}</i>
        </div>
        <div
          class="ur-item cbtn scnd"
          v-on:click="control(controls.move.down.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.move.down.icon">{{
            keybindToggle ? controls.move.down.keybind : ""
          }}</i>
        </div>
      </div>
      <div class="udlr-group mr">
        <div class="h2-item">Look</div>
        <div
          class="u-item cbtn prm"
          v-on:click="control(controls.look.up.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.look.up.icon">{{
            keybindToggle ? controls.look.up.keybind : ""
          }}</i>
        </div>
        <div
          class="d-item cbtn prm"
          v-on:click="control(controls.look.down.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.look.down.icon">{{
            keybindToggle ? controls.look.down.keybind : ""
          }}</i>
        </div>
        <div
          class="l-item cbtn prm"
          v-on:click="control(controls.look.left.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.look.left.icon">{{
            keybindToggle ? controls.look.left.keybind : ""
          }}</i>
        </div>
        <div
          class="r-item cbtn prm"
          v-on:click="control(controls.look.right.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.look.right.icon">{{
            keybindToggle ? controls.look.right.keybind : ""
          }}</i>
        </div>
        <div
          class="ul-item cbtn scnd"
          v-on:click="control(controls.look.zoomin.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.look.zoomin.icon">{{
            keybindToggle ? controls.look.zoomin.keybind : ""
          }}</i>
        </div>
        <div
          class="ur-item cbtn scnd"
          v-on:click="control(controls.look.zoomout.keybind, camera)"
        >
          <i :class="keybindToggle ? '' : controls.look.zoomout.icon">{{
            keybindToggle ? controls.look.zoomout.keybind : ""
          }}</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
import SwitchButton from "@/components/SwitchButton.vue";
var mv = MatrixMath.methods;

export default {
  name: "WebglCamera",
  props: {
    camera: Object
  },
  components: {
    SwitchButton
  },
  data() {
    return {
      keybindToggle: false,
      controls: {
        move: {
          forward: { keybind: "w", icon: "fa fa-caret-up" },
          backward: { keybind: "s", icon: "fa fa-caret-down" },
          left: { keybind: "a", icon: "fa fa-caret-left" },
          right: { keybind: "d", icon: "fa fa-caret-right" },
          up: { keybind: "q", icon: "fa fa-arrow-up" },
          down: { keybind: "e", icon: "fa fa-arrow-down" }
        },
        look: {
          up: { keybind: "u", icon: "fa fa-caret-up" },
          down: { keybind: "j", icon: "fa fa-caret-down" },
          left: { keybind: "h", icon: "fa fa-caret-left" },
          right: { keybind: "k", icon: "fa fa-caret-right" },
          zoomin: { keybind: "y", icon: "fa fa-plus" },
          zoomout: { keybind: "i", icon: "fa fa-minus" }
        }
      }
    };
  },
  methods: {
    initCamera(origCameraPos) {
      var camera = {
        theta: 0.0,
        phi: 0.0,
        dr: mv.radians(1),
        eye: mv.vec3(0, 0, 0),
        up: mv.vec3(0.0, 1.0, 0.0),
        fovy: 90,
        translation: mv.translationMatrix(origCameraPos),
        origCameraPosition: origCameraPos
      };
      return camera;
    },
    control(ch, camera) {
      // Make sure character "ch" is lowercase
      ch = ch.toLowerCase();

      // Increas or decreas azimuth with h and k (look left or right)
      if (ch === this.controls.look.left.keybind) {
        camera.phi += camera.dr;
        return;
      }
      if (ch === this.controls.look.right.keybind) {
        camera.phi -= camera.dr;
        return;
      }
      // Increase/decrease Altitude with u and j (loop up or down)
      if (ch === this.controls.look.up.keybind) {
        if (camera.theta < 1.55) {
          camera.theta += camera.dr;
        }
        return;
      }
      if (ch === this.controls.look.down.keybind) {
        if (camera.theta > -1.55) {
          camera.theta -= camera.dr;
        }
        return;
      }

      // Widen or narrow the verticle feild of view with g or b (zoom in or zoom out essentially)
      if (ch === this.controls.look.zoomout.keybind) {
        camera.fovy += 1;
        return;
      }
      if (ch === this.controls.look.zoomin.keybind) {
        camera.fovy -= 1;
        return;
      }

      // By rotating the original orthonormal basis twice we get a new ortonormal
      // basis that is based on our current camera position
      var orthoNormal = mv.rotationMatrix((camera.phi * 180) / Math.PI, [
        0,
        1,
        0
      ]);
      orthoNormal = mv.mult(
        mv.rotationMatrix((-1 * camera.theta * 180) / Math.PI, [0, 0, 1]),
        orthoNormal
      );

      // Using the orthonormal basis, move forward, backward, left, right, up and down
      // Left
      if (ch === this.controls.move.left.keybind) {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              0.25 * orthoNormal[2][0],
              0.25 * orthoNormal[2][1],
              0.25 * orthoNormal[2][2]
            )
          )
        );
      }
      // Backward
      if (ch === this.controls.move.backward.keybind) {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              0.25 * orthoNormal[0][0],
              0.25 * orthoNormal[0][1],
              0.25 * orthoNormal[0][2]
            )
          )
        );
      }
      // Right
      if (ch === this.controls.move.right.keybind) {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              -0.25 * orthoNormal[2][0],
              -0.25 * orthoNormal[2][1],
              -0.25 * orthoNormal[2][2]
            )
          )
        );
      }
      // Forward
      if (ch === this.controls.move.forward.keybind) {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              -0.25 * orthoNormal[0][0],
              -0.25 * orthoNormal[0][1],
              -0.25 * orthoNormal[0][2]
            )
          )
        );
      }
      // Upward
      if (ch === this.controls.move.up.keybind) {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              -0.25 * orthoNormal[1][0],
              -0.25 * orthoNormal[1][1],
              -0.25 * orthoNormal[1][2]
            )
          )
        );
      }
      // Downward
      if (ch === this.controls.move.down.keybind) {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              0.25 * orthoNormal[1][0],
              0.25 * orthoNormal[1][1],
              0.25 * orthoNormal[1][2]
            )
          )
        );
      }
      return;
    }
  }
};
</script>
<style lang="scss">
@import "@/assets/styles/variables.scss";
#webgl-camera-controls {
  user-select: none;
  .crtl-container {
    display: grid;
    grid-template-areas:
      ".  .  h  h  kt kt"
      "ml ml ml mr mr mr"
      "ml ml ml mr mr mr"
      "ml ml ml mr mr mr";
    grid-template-columns: repeat(6, 1fr);
    .h-item {
      grid-area: h;
      font-weight: bold;
    }
    .ml {
      grid-area: ml;
    }
    .mr {
      grid-area: mr;
    }
    .main-tr {
      grid-area: kt;
      font-size: 10px;
      font-weight: 300;
      text-align: right;
    }
    grid-gap: 2px;
    background-color: rgba($nav-bg, 0.3);
    border-radius: 0.35em;
    margin-bottom: 1em;
    text-align: center;
    .udlr-group {
      display: grid;
      justify-content: center;
      grid-template-areas:
        " h2 h2 h2"
        " .  u  . "
        " l  d  r ";
      .h2-item {
        grid-area: h2;
        font-size: 14px;
        font-weight: bold;
      }
      .u-item {
        grid-area: u;
      }
      .d-item {
        grid-area: d;
      }
      .l-item {
        grid-area: l;
      }
      .r-item {
        grid-area: r;
      }
      padding: 2px;
      border-radius: 0.35em;
      margin: 0.5em;
      text-align: center;
      .cbtn {
        text-align: center;
        margin: 0.25em;
        color: darken($nav-txt, 15%);
        border-radius: 0.35em;
        height: 30px;
        width: 50px;
      }
      .prm {
        background-color: rgba($nav-bg, 0.2);
        &:hover {
          color: $nav-txt;
          background-color: rgba($nav-bg, 0.6);
        }
      }
      .scnd {
        background-color: rgba(darken($nav-bg, 20%), 0.3);
        color: darken($nav-txt, 30%);
        &:hover {
          color: darken($nav-txt, 20%);
          background-color: rgba(darken($nav-bg, 20%), 0.6);
        }
      }
    }
  }
}
</style>
