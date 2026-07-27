<template>
  <div id="webgl-camera-ctrls" class="bg1">
    <ControlHelpModal v-if="showModal" @close="modalToggle(false)" title="Camera Control Help" :ctrls="ctrls" :depth="2" />
    <div class="crtl-container">
      <div class="h-item">
        <div>
          Camera Controls&nbsp;
          <i class="fas fa-question-circle icn" @click="modalToggle(true)"></i>
        </div>
      </div>
      <SwitchButton :isEnabled="kbToggle" class="main-tr" @toggle="kbToggle = !kbToggle">Show Keyboard Binds</SwitchButton>
      <div v-for="cType in Object.keys(gridLayout)" :class="['udlr-group', gridLayout[cType]!.gClass]" :key="cType">
        <div class="h2-item">{{ gridLayout[cType]!.gTitle }}</div>
        <!-- eslint-disable vue/no-mutating-props -->
        <div
          v-for="btn in gridLayout[cType]!.gKeys"
          :key="btn.ctrlName"
          :class="[...btn.cls, { pactive: ctrls[cType]![btn.ctrlName]!.updateFlag }]"
          @mousedown="ctrls[cType]![btn.ctrlName]!.updateFlag = true"
          @touchstart="ctrls[cType]![btn.ctrlName]!.updateFlag = true"
          @mouseup="ctrls[cType]![btn.ctrlName]!.updateFlag = false"
          @touchend="ctrls[cType]![btn.ctrlName]!.updateFlag = false"
        >
          <i :class="kbToggle ? '' : ctrls[cType]![btn.ctrlName]!.icon">
            {{ kbToggle ? ctrls[cType]![btn.ctrlName]!.keybind : "" }}
          </i>
        </div>
        <!-- eslint-enable vue/no-mutating-props -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SwitchButton from "@/components/SwitchButton.vue";
import ControlHelpModal from "@/components/webgl/ControlHelpModal.vue";
import type { CameraCtrlMap } from "@/utils/webgl/types";

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  camera: any;
  ctrls: CameraCtrlMap;
}>();

const btnClassList1 = ["cbtn", "prm", "bg1-hvr", "bg1-txt-hvr"];
const btnClassList2 = ["cbtn", "scnd", "bg1-txt-hvr"];

const kbToggle = ref(false);
const showModal = ref(false);

const gridLayout: Record<string, { gClass: string; gTitle: string; gKeys: { cls: string[]; ctrlName: string }[] }> = {
  move: {
    gClass: "ml",
    gTitle: "Move",
    gKeys: [
      { cls: ["u-item"].concat(btnClassList1), ctrlName: "forward" },
      { cls: ["d-item"].concat(btnClassList1), ctrlName: "backward" },
      { cls: ["l-item"].concat(btnClassList1), ctrlName: "left" },
      { cls: ["r-item"].concat(btnClassList1), ctrlName: "right" },
      { cls: ["ul-item"].concat(btnClassList2), ctrlName: "up" },
      { cls: ["ul-item"].concat(btnClassList2), ctrlName: "down" },
    ],
  },
  look: {
    gClass: "mr",
    gTitle: "Look",
    gKeys: [
      { cls: ["u-item"].concat(btnClassList1), ctrlName: "up" },
      { cls: ["d-item"].concat(btnClassList1), ctrlName: "down" },
      { cls: ["l-item"].concat(btnClassList1), ctrlName: "left" },
      { cls: ["r-item"].concat(btnClassList1), ctrlName: "right" },
      { cls: ["ul-item"].concat(btnClassList2), ctrlName: "zoomin" },
      { cls: ["ul-item"].concat(btnClassList2), ctrlName: "zoomout" },
    ],
  },
};

function modalToggle(b: boolean) {
  showModal.value = b;
  document.documentElement.style.overflow = b ? "hidden" : "auto";
}
</script>
<style lang="scss">
@import "@/assets/styles/wrapper.scss";
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
      padding-right: 5px;
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
        @media only screen and (max-width: 850px) {
          height: 28.5px;
          width: 47.5px;
        }
        @media only screen and (max-width: 700px) {
          height: 27px;
          width: 45px;
        }
        cursor: pointer;
      }
    }
  }
}
</style>
