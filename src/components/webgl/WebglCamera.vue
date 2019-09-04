<template>
  <div id="webgl-camera-ctrls">
    <div class="crtl-container">
      <div class="h-item">Camera Controls</div>
      <switch-button v-model="kbToggle" class="main-tr"
        >Show Keyboard Binds</switch-button
      >
      <template v-for="cType in Object.keys(gridLayout)">
        <div :class="['udlr-group', gridLayout[cType].gClass]" :key="cType.id">
          <div class="h2-item">{{ gridLayout[cType].gTitle }}</div>
          <template v-for="btn in gridLayout[cType].gKeys">
            <div
              :key="btn.id"
              :class="btn.cls"
              v-on:click="control(ctrls[cType][btn.ctrlName].keybind, camera)"
            >
              <i :class="kbToggle ? '' : ctrls[cType][btn.ctrlName].icon">
                {{ kbToggle ? ctrls[cType][btn.ctrlName].keybind : "" }}
              </i>
            </div>
          </template>
        </div>
      </template>
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
      kbToggle: false,
      ctrls: this.defaultControls(),
      gridLayout: {
        move: {
          gClass: "ml",
          gTitle: "Move",
          gKeys: [
            { cls: "u-item cbtn prm", ctrlName: "forward" },
            { cls: "d-item cbtn prm", ctrlName: "backward" },
            { cls: "l-item cbtn prm", ctrlName: "left" },
            { cls: "r-item cbtn prm", ctrlName: "right" },
            { cls: "ul-item cbtn scnd", ctrlName: "up" },
            { cls: "ur-item cbtn scnd", ctrlName: "down" }
          ]
        },
        look: {
          gClass: "mr",
          gTitle: "Look",
          gKeys: [
            { cls: "u-item cbtn prm", ctrlName: "up" },
            { cls: "d-item cbtn prm", ctrlName: "down" },
            { cls: "l-item cbtn prm", ctrlName: "left" },
            { cls: "r-item cbtn prm", ctrlName: "right" },
            { cls: "ul-item cbtn scnd", ctrlName: "zoomin" },
            { cls: "ur-item cbtn scnd", ctrlName: "zoomout" }
          ]
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
    defaultControls() {
      var ctrls = {
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
      };
      return ctrls;
    },
    control(ch, camera, ctrls) {
      // Make sure character "ch" is lowercase
      ch = ch.toLowerCase();

      // Make default ctrls if no ctrls were passed
      if (!ctrls) {
        ctrls = this.defaultControls();
      }

      // Increas or decreas azimuth with h and k (look left or right)
      if (ch === ctrls.look.left.keybind) {
        camera.phi += camera.dr;
        return;
      }
      if (ch === ctrls.look.right.keybind) {
        camera.phi -= camera.dr;
        return;
      }
      // Increase/decrease Altitude with u and j (loop up or down)
      if (ch === ctrls.look.up.keybind) {
        if (camera.theta < 1.55) {
          camera.theta += camera.dr;
        }
        return;
      }
      if (ch === ctrls.look.down.keybind) {
        if (camera.theta > -1.55) {
          camera.theta -= camera.dr;
        }
        return;
      }

      // Widen or narrow the verticle feild of view with g or b (zoom in or zoom out essentially)
      if (ch === ctrls.look.zoomout.keybind) {
        camera.fovy += 1;
        return;
      }
      if (ch === ctrls.look.zoomin.keybind) {
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
      if (ch === ctrls.move.left.keybind) {
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
      if (ch === ctrls.move.backward.keybind) {
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
      if (ch === ctrls.move.right.keybind) {
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
      if (ch === ctrls.move.forward.keybind) {
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
      if (ch === ctrls.move.up.keybind) {
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
      if (ch === ctrls.move.down.keybind) {
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
#webgl-camera-ctrls {
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
