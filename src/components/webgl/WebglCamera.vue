<template>
  <div id="webgl-camera-ctrls">
    <control-help-modal
      v-if="showModal"
      @close="showModal = false"
      title="Camera Control Help"
      :ctrls="ctrls"
      :depth="2"
    />
    <div class="crtl-container">
      <div class="h-item">
        Camera Controls&nbsp;
        <i class="fas fa-question-circle" @click="showModal = true"></i>
      </div>
      <switch-button v-model="kbToggle" class="main-tr"
        >Show Keyboard Binds</switch-button
      >
      <template v-for="cType in Object.keys(gridLayout)">
        <div :class="['udlr-group', gridLayout[cType].gClass]" :key="cType.id">
          <div class="h2-item">{{ gridLayout[cType].gTitle }}</div>
          <template v-for="btn in gridLayout[cType].gKeys">
            <div
              :key="btn.id"
              :class="
                btn.cls.concat({
                  pactive: ctrls[cType][btn.ctrlName].updateFlag
                })
              "
              @mousedown="ctrls[cType][btn.ctrlName].updateFlag = true"
              @touchstart="ctrls[cType][btn.ctrlName].updateFlag = true"
              @mouseup="ctrls[cType][btn.ctrlName].updateFlag = false"
              @touchend="ctrls[cType][btn.ctrlName].updateFlag = false"
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
import ControlHelpModal from "@/components/webgl/ControlHelpModal.vue";
var mv = MatrixMath.methods;

export default {
  name: "WebglCamera",
  props: {
    camera: Object,
    ctrls: Object
  },
  components: {
    SwitchButton,
    ControlHelpModal
  },
  data() {
    return {
      kbToggle: false,
      showModal: false,
      gridLayout: {
        move: {
          gClass: "ml",
          gTitle: "Move",
          gKeys: [
            { cls: ["u-item", "cbtn", "prm"], ctrlName: "forward" },
            { cls: ["d-item", "cbtn", "prm"], ctrlName: "backward" },
            { cls: ["l-item", "cbtn", "prm"], ctrlName: "left" },
            { cls: ["r-item", "cbtn", "prm"], ctrlName: "right" },
            { cls: ["ul-item", "cbtn", "scnd"], ctrlName: "up" },
            { cls: ["ul-item", "cbtn", "scnd"], ctrlName: "down" }
          ]
        },
        look: {
          gClass: "mr",
          gTitle: "Look",
          gKeys: [
            { cls: ["u-item", "cbtn", "prm"], ctrlName: "up" },
            { cls: ["d-item", "cbtn", "prm"], ctrlName: "down" },
            { cls: ["l-item", "cbtn", "prm"], ctrlName: "left" },
            { cls: ["r-item", "cbtn", "prm"], ctrlName: "right" },
            { cls: ["ul-item", "cbtn", "scnd"], ctrlName: "zoomin" },
            { cls: ["ul-item", "cbtn", "scnd"], ctrlName: "zoomout" }
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
        orthoNormal: this.genOrthoNormal(0.0, 0.0),
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
            desc: "Move forward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, -1, 0);
            }
          },
          backward: {
            keybind: "s",
            icon: "fas fa-caret-down",
            desc: "Move backward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, 1, 0);
            }
          },
          left: {
            keybind: "a",
            icon: "fas fa-caret-left",
            desc: "Strafe left",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, 1, 2);
            }
          },
          right: {
            keybind: "d",
            icon: "fas fa-caret-right",
            desc: "Strafe right",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, -1, 2);
            }
          },
          up: {
            keybind: "q",
            icon: "fas fa-arrow-up",
            desc: "Float upward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, -1, 1);
            }
          },
          down: {
            keybind: "e",
            icon: "fas fa-arrow-down",
            desc: "Sink downward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, 1, 1);
            }
          }
        },
        look: {
          up: {
            keybind: "u",
            icon: "fas fa-caret-up",
            desc: "Look upward",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              if (vav.camera.theta < 1.55) {
                vav.camera.theta += vav.camera.dr;
                vav.camera.orthoNormalUpdateFlag = true;
              }
            }
          },
          down: {
            keybind: "j",
            icon: "fas fa-caret-down",
            desc: "Look downward",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              if (vav.camera.theta > -1.55) {
                vav.camera.theta -= vav.camera.dr;
                vav.camera.orthoNormalUpdateFlag = true;
              }
            }
          },
          left: {
            keybind: "h",
            icon: "fas fa-caret-left",
            desc: "Look left",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.phi -= vav.camera.dr;
              vav.camera.orthoNormalUpdateFlag = true;
            }
          },
          right: {
            keybind: "k",
            icon: "fas fa-caret-right",
            desc: "Look right",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.phi += vav.camera.dr;
              vav.camera.orthoNormalUpdateFlag = true;
            }
          },
          zoomin: {
            keybind: "y",
            icon: "fas fa-plus",
            desc: "Narrow field of view",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.fovy -= 1;
            }
          },
          zoomout: {
            keybind: "i",
            icon: "fas fa-minus",
            desc: "Widen field of view",
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
    },

    genOrthoNormal(phi, theta) {
      // By rotating the original orthonormal basis twice we get a new ortonormal
      // basis that is based on our current camera position
      var orthoNormal = mv.rotationMatrix((phi * 180) / Math.PI, [0, 1, 0]);
      orthoNormal = mv.mult(
        mv.rotationMatrix((-1 * theta * 180) / Math.PI, [0, 0, 1]),
        orthoNormal
      );
      return orthoNormal;
    },

    move(camera, d, vectorNum) {
      // Using the orthonormal basis, move forward, backward, left, right, up and down
      if (camera.orthoNormalUpdateFlag) {
        camera.orthoNormal = this.genOrthoNormal(camera.phi, camera.theta);
        camera.orthoNormalUpdateFlag = false;
      }
      let onv = camera.orthoNormal[vectorNum];
      camera.translation = mv.mult(
        camera.translation,
        mv.translationMatrix(
          mv.vec3(
            camera.stepSize * d * onv[0],
            camera.stepSize * d * onv[1],
            camera.stepSize * d * onv[2]
          )
        )
      );
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
      i {
        cursor: pointer;
        color: darken($nav-txt, 20%);
        &:hover {
          color: $nav-txt;
        }
      }
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
        cursor: pointer;
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
          color: $nav-txt;
          background-color: rgba($nav-bg, 0.6);
        }
      }
      .pactive {
        color: $nav-txt;
        background-color: rgba($nav-bg, 0.6);
      }
    }
  }
}
</style>
