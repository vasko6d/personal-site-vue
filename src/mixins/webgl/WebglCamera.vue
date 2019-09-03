<template>
  <div id="webgl-camera-controls">
    <div class="crtl-container">
      <div class="h-item">Camera Controls</div>
      <switch-button v-model="keybindToggle" class="main-tr"
        >Show Kinbind Toggle</switch-button
      >
      <div class="udlr-group ml">
        <div class="h2-item">Move</div>
        <div class="u-item cbtn prm" v-on:click="control('w', camera)">
          <span v-if="keybindToggle">{{ controls.move.forward.keybind }}</span>
          <span v-else v-html="controls.move.forward.icon"></span>
        </div>
        <div class="d-item cbtn prm" v-on:click="control('s', camera)">
          <span v-if="keybindToggle">{{ controls.move.backward.keybind }}</span>
          <span v-else v-html="controls.move.backward.icon"></span>
        </div>
        <div class="l-item cbtn prm" v-on:click="control('a', camera)">
          <span v-if="keybindToggle">{{ controls.move.left.keybind }}</span>
          <span v-else v-html="controls.move.left.icon"></span>
        </div>
        <div class="r-item cbtn prm" v-on:click="control('d', camera)">
          <span v-if="keybindToggle">{{ controls.move.right.keybind }}</span>
          <span v-else v-html="controls.move.right.icon"></span>
        </div>
        <div class="ul-item cbtn scnd" v-on:click="control('q', camera)">
          <span v-if="keybindToggle">{{ controls.move.up.keybind }}</span>
          <span v-else v-html="controls.move.up.icon"></span>
        </div>
        <div class="ur-item cbtn scnd" v-on:click="control('e', camera)">
          <span v-if="keybindToggle">{{ controls.move.down.keybind }}</span>
          <span v-else v-html="controls.move.down.icon"></span>
        </div>
      </div>
      <div class="udlr-group mr">
        <div class="h2-item">Look</div>
        <div class="u-item cbtn prm" v-on:click="control('u', camera)">
          <span v-if="keybindToggle">{{ controls.look.up.keybind }}</span>
          <span v-else v-html="controls.look.up.icon"></span>
        </div>
        <div class="d-item cbtn prm" v-on:click="control('j', camera)">
          <span v-if="keybindToggle">{{ controls.look.down.keybind }}</span>
          <span v-else v-html="controls.look.down.icon"></span>
        </div>
        <div class="l-item cbtn prm" v-on:click="control('h', camera)">
          <span v-if="keybindToggle">{{ controls.look.left.keybind }}</span>
          <span v-else v-html="controls.look.left.icon"></span>
        </div>
        <div class="r-item cbtn prm" v-on:click="control('d', camera)">
          <span v-if="keybindToggle">{{ controls.look.right.keybind }}</span>
          <span v-else v-html="controls.look.right.icon"></span>
        </div>
        <div class="ul-item cbtn scnd" v-on:click="control('y', camera)">
          <span v-if="keybindToggle">{{ controls.look.zoomin.keybind }}</span>
          <span v-else v-html="controls.look.zoomin.icon"></span>
        </div>
        <div class="ur-item cbtn scnd" v-on:click="control('i', camera)">
          <span v-if="keybindToggle">{{ controls.look.zoomout.keybind }}</span>
          <span v-else v-html="controls.look.zoomout.icon"></span>
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
          forward: {
            keybind: "w",
            icon: "<i class='fa fa-caret-up'></i>"
          },
          backward: {
            keybind: "s",
            icon: "<i class='fa fa-caret-down'></i>"
          },
          left: {
            keybind: "a",
            icon: "<i class='fa fa-caret-left'></i>"
          },
          right: {
            keybind: "d",
            icon: "<i class='fa fa-caret-up'></i>"
          },
          up: {
            keybind: "q",
            icon: "<i class='fa fa-arrow-up'></i>"
          },
          down: {
            keybind: "e",
            icon: "<i class='fa fa-arrow-down'></i>"
          }
        },
        look: {
          up: {
            keybind: "u",
            icon: "<i class='fa fa-caret-up'></i>"
          },
          down: {
            keybind: "j",
            icon: "<i class='fa fa-caret-down'></i>"
          },
          left: {
            keybind: "h",
            icon: "<i class='fa fa-caret-left'></i>"
          },
          right: {
            keybind: "k",
            icon: "<i class='fa fa-caret-up'></i>"
          },
          zoomin: {
            keybind: "y",
            icon: "<i class='fa fa-plus'></i>"
          },
          zoomout: {
            keybind: "i",
            icon: "<i class='fa fa-minus'></i>"
          }
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
      // Increas or decreas azimuth with h and k (look left or right)
      if (ch === "k") {
        camera.phi += camera.dr;
        return;
      }
      if (ch === "h") {
        camera.phi -= camera.dr;
        return;
      }
      // Increase/decrease Altitude with u and j (loop up or down)
      if (ch === "u") {
        if (camera.theta < 1.55) {
          camera.theta += camera.dr;
        }
        return;
      }
      if (ch === "j") {
        if (camera.theta > -1.55) {
          camera.theta -= camera.dr;
        }
        return;
      }

      // Widen or narrow the verticle feild of view with g or b (zoom in or zoom out essentially)
      if (ch === "i") {
        camera.fovy += 1;
        return;
      }
      if (ch === "y") {
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
      if (ch === "a") {
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
      if (ch === "s") {
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
      if (ch === "d") {
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
      if (ch === "w") {
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
      if (ch === "q") {
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
      if (ch === "e") {
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
      //background-color: rgba($nav-bg, 0.2);
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
        width: 60px;
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
