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
        <div>
          Camera Controls&nbsp;
          <i class="fas fa-question-circle" @click="showModal = true"></i>
        </div>
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
    initCamera(cameraProps) {
      var camera = {
        theta: 0.0, // up down angle
        phi: 0.0, // left right angle
        alpha: 0.0, // rolling angle
        dr: mv.rad(1),
        fovy: 90,
        aspect: 1,
        near: 0.1,
        far: 100,
        stepSize: 0.25,
        position: mv.vec3(1, 0, 0), // this is also "eye"
        initialProps: cameraProps
      };
      this.setProps(camera, cameraProps);
      return camera;
    },

    setProps(camera, cameraProps) {
      for (var prop of Object.keys(camera)) {
        if (cameraProps[prop]) {
          camera[prop] = cameraProps[prop];
        }
      }
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
              this.move(vav.camera, 1, 0);
            }
          },
          backward: {
            keybind: "s",
            icon: "fas fa-caret-down",
            desc: "Move backward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, -1, 0);
            }
          },
          left: {
            keybind: "a",
            icon: "fas fa-caret-left",
            desc: "Strafe left",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, -1, 2);
            }
          },
          right: {
            keybind: "d",
            icon: "fas fa-caret-right",
            desc: "Strafe right",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, 1, 2);
            }
          },
          up: {
            keybind: "q",
            icon: "fas fa-arrow-up",
            desc: "Float upward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, 1, 1);
            }
          },
          down: {
            keybind: "e",
            icon: "fas fa-arrow-down",
            desc: "Sink downward",
            holdable: true,
            updateFlag: false,
            updateFxn: vav => {
              this.move(vav.camera, -1, 1);
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
              if (vav.camera.theta < mv.rad(90)) {
                vav.camera.theta += vav.camera.dr;
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
              if (vav.camera.theta > -mv.rad(90)) {
                vav.camera.theta -= vav.camera.dr;
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
            }
          },
          rollLeft: {
            keybind: "l",
            icon: "fas fa-redo",
            desc: "Roll Camera View Clockwise",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.alpha += vav.camera.dr;
            }
          },
          rollRight: {
            keybind: "o",
            icon: "fas fa-redo fa-flip-horizontal",
            desc: "Roll Camera View Counter-clockwise",
            holdable: true,
            updateFlag: false,
            updateFxn(vav) {
              vav.camera.alpha -= vav.camera.dr;
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

    viewMatrix(camera) {
      return mv.lookAt(
        camera.position,
        this.atPosition(camera),
        this.upVector(camera)
      );
    },

    perspectiveMatrix(camera) {
      return mv.perspective(
        camera.fovy,
        camera.aspect,
        camera.near,
        camera.far
      );
    },

    atPosition(camera) {
      return mv.add(this.atVector(camera), camera.position);
    },

    atVector(camera) {
      return mv.vec3(
        Math.cos(camera.theta) * Math.cos(camera.phi),
        Math.sin(camera.theta),
        Math.cos(camera.theta) * Math.sin(camera.phi)
      );
    },

    setAt(camera, atPos) {
      var atVec = mv.normalize(mv.subtract(atPos, camera.position));
      // phases on arc trig functions are annoying. This may only work in my planets case...
      // ...will troubleshoot further errors if teh come up
      var correction = atVec[2] < 0 ? -1 : 1;
      camera.theta = Math.asin(atVec[1]);
      camera.phi = Math.acos(atVec[0] / Math.cos(camera.theta)) * correction;
    },

    upVector(camera) {
      let cos = {
        t: Math.cos(camera.theta),
        p: Math.cos(camera.phi),
        a: Math.cos(camera.alpha)
      };
      let sin = {
        t: Math.sin(camera.theta),
        p: Math.sin(camera.phi),
        a: Math.sin(camera.alpha)
      };
      return mv.vec3(
        -sin.t * cos.p * cos.a - sin.p * sin.a,
        cos.t * cos.a,
        -sin.t * sin.p * cos.a + cos.p * sin.a
      );
    },

    move(camera, direction, vectorNum) {
      // create Orthonormal Basis based on camera
      var up = this.upVector(camera);
      var forward = this.atVector(camera);
      var right = mv.normalize(mv.cross(forward, up));
      var otrhoNormalBasis = [forward, up, right];

      let v = otrhoNormalBasis[vectorNum];
      let dx = camera.stepSize * direction;
      camera.position = mv.add(
        camera.position,
        mv.vec3(dx * v[0], dx * v[1], dx * v[2])
      );
    }
  }
};
</script>
<style lang="scss">
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/light-theme.scss";
}
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
        border-radius: 0.35em;
        height: 30px;
        width: 50px;
        cursor: pointer;
      }
    }
  }
}
</style>
