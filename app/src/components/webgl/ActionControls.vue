<template>
  <div id="action-ctrls" class="bg1">
    <ControlHelpModal v-if="showModal" @close="modalToggle(false)" title="Action Control Help" :ctrls="actionCtrls" :depth="1" />
    <div class="crtl-container">
      <div class="head-container">
        <div class="h-item">
          Action Controls&nbsp;
          <i class="fas fa-question-circle icn" @click="modalToggle(true)"></i>
        </div>
        <SwitchButton :isEnabled="kbToggle" class="main-tr" @toggle="kbToggle = !kbToggle">Show Keyboard Binds</SwitchButton>
      </div>
      <div class="btn-grid">
        <!-- eslint-disable vue/no-mutating-props -->
        <div
          v-for="aKey in Object.keys(actionCtrls)"
          :key="aKey"
          :class="['cbtn', 'prm', 'bg1-hvr', 'bg1-txt-hvr', { pactive: actionCtrls[aKey]!.framesActive > 0 }]"
          @mousedown="actionCtrls[aKey]!.updateFlag = true"
          @touchstart="actionCtrls[aKey]!.updateFlag = true"
          @mouseup="actionCtrls[aKey]!.updateFlag = false"
          @touchend="actionCtrls[aKey]!.updateFlag = false"
        >
          <i :class="kbToggle ? '' : actionCtrls[aKey]!.icon">
            {{ kbToggle ? actionCtrls[aKey]!.keybind : "" }}
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
import type { ActionCtrlMap } from "@/utils/webgl/types";

defineProps<{
  actionCtrls: ActionCtrlMap;
}>();

const kbToggle = ref(false);
const showModal = ref(false);

function modalToggle(b: boolean) {
  showModal.value = b;
  document.documentElement.style.overflow = b ? "hidden" : "auto";
}
</script>
<style lang="scss">
@import "@/assets/styles/wrapper.scss";
#action-ctrls {
  user-select: none;
  .crtl-container {
    border-radius: 0.35em;
    margin-top: 1em;
    margin-bottom: 1em;
    padding-bottom: 0.5em;
    text-align: center;
    .head-container {
      display: grid;
      grid-template-areas: ".  .  h  h  kt kt";
      grid-template-columns: repeat(6, 1fr);
      margin-bottom: 0.5em;
      .h-item {
        grid-area: h;
        font-weight: bold;
        i {
          cursor: pointer;
        }
      }
      .main-tr {
        grid-area: kt;
        padding-right: 5px;
        font-size: 10px;
        font-weight: 300;
        text-align: right;
      }
    }
    .btn-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 10px;
      margin-bottom: 0.5em;
      .cbtn {
        text-align: center;
        margin: 0.25em;
        border-radius: 0.35em;
        height: 30px;
        cursor: pointer;
      }
    }
  }
}
</style>
