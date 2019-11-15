<template>
  <div id="action-ctrls" class="bg1">
    <control-help-modal
      v-if="showModal"
      @close="modalToggle(false)"
      title="Action Control Help"
      :ctrls="actionCtrls"
      :depth="1"
    />
    <div class="crtl-container">
      <div class="head-container">
        <div class="h-item">
          Action Controls&nbsp;
          <i class="fas fa-question-circle icn" @click="modalToggle(true)"></i>
        </div>
        <switch-button
          :isEnabled="kbToggle"
          class="main-tr"
          @toggle="kbToggle = !kbToggle"
          >Show Keyboard Binds</switch-button
        >
      </div>
      <div class="btn-grid">
        <template v-for="aKey in Object.keys(actionCtrls)">
          <div
            :key="actionCtrls[aKey].id"
            :class="[
              'cbtn',
              'prm',
              'bg1-hvr',
              'bg1-txt-hvr',
              { pactive: actionCtrls[aKey].framesActive > 0 }
            ]"
            @mousedown="actionCtrls[aKey].updateFlag = true"
            @touchstart="actionCtrls[aKey].updateFlag = true"
            @mouseup="actionCtrls[aKey].updateFlag = false"
            @touchend="actionCtrls[aKey].updateFlag = false"
          >
            <i :class="kbToggle ? '' : actionCtrls[aKey].icon">{{
              kbToggle ? actionCtrls[aKey].keybind : ""
            }}</i>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import SwitchButton from "@/components/SwitchButton.vue";
import ControlHelpModal from "@/components/webgl/ControlHelpModal.vue";
export default {
  name: "ActionControls",
  props: {
    actionCtrls: Object
  },
  components: {
    SwitchButton,
    ControlHelpModal
  },
  data() {
    return {
      kbToggle: false,
      showModal: false
    };
  },
  methods: {
    modalToggle(b) {
      this.showModal = b;
      if (b) {
        document.documentElement.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "auto";
      }
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
