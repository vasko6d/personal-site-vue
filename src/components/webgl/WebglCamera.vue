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
              v-on:click="ctrls[cType][btn.ctrlName].updateFlag = true"
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
    camera: Object,
    ctrls: Object
  },
  components: {
    SwitchButton
  },
  data() {
    return {
      kbToggle: false,
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
        stepSize: 0.25,
        translation: mv.translationMatrix(origCameraPos),
        orthoNormal: mv.genOrthoNormal(0.0, 0.0),
        orthoNormalUpdateFlag: false,
        origCameraPosition: origCameraPos
      };
      return camera;
    },

    defaultControls() {
      var ctrls = {
        move: {
          forward: {
            keybind: "w",
            icon: "fas fa-caret-up",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              mv.move(vav.camera, -1, 0);
            }
          },
          backward: {
            keybind: "s",
            icon: "fas fa-caret-down",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              mv.move(vav.camera, 1, 0);
            }
          },
          left: {
            keybind: "a",
            icon: "fas fa-caret-left",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              mv.move(vav.camera, 1, 2);
            }
          },
          right: {
            keybind: "d",
            icon: "fas fa-caret-right",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              mv.move(vav.camera, -1, 2);
            }
          },
          up: {
            keybind: "q",
            icon: "fas fa-arrow-up",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              mv.move(vav.camera, -1, 1);
            }
          },
          down: {
            keybind: "e",
            icon: "fas fa-arrow-down",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              mv.move(vav.camera, 1, 1);
            }
          }
        },
        look: {
          up: {
            keybind: "u",
            icon: "fas fa-caret-up",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              if (vav.camera.theta < 1.55) {
                vav.camera.theta += vav.camera.dr;
              }
            }
          },
          down: {
            keybind: "j",
            icon: "fas fa-caret-down",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              if (vav.camera.theta > -1.55) {
                vav.camera.theta -= vav.camera.dr;
              }
            }
          },
          left: {
            keybind: "h",
            icon: "fas fa-caret-left",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.phi -= vav.camera.dr;
            }
          },
          right: {
            keybind: "k",
            icon: "fas fa-caret-right",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.phi += vav.camera.dr;
            }
          },
          zoomin: {
            keybind: "y",
            icon: "fas fa-plus",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.fovy -= 1;
            }
          },
          zoomout: {
            keybind: "i",
            icon: "fas fa-minus",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.fovy += 1;
            }
          }
        }
      };
      return ctrls;
    },

    genInvertedControlObject(ctrls, prePath) {
      var invCtrls = {};
      const cKeys = Object.keys(ctrls);
      for (var cKey of cKeys) {
        invCtrls[ctrls[cKey].keybind] = prePath ? [prePath, cKey] : [cKey];
      }
      return invCtrls;
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
    margin-top: 1em;
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
