<template>
  <div id="action-ctrls">
    <div class="crtl-container">
      <div class="head-container">
        <div class="h-item">
          Action Controls&nbsp;
          <i class="fas fa-question-circle"></i>
        </div>
        <switch-button v-model="kbToggle" class="main-tr"
          >Show Keyboard Binds</switch-button
        >
      </div>
      <div class="btn-grid">
        <template v-for="aKey in Object.keys(actionCtrls)">
          <div
            :key="actionCtrls[aKey].id"
            class="cbtn prm"
            v-on:click="actionCtrls[aKey].updateFlag = true"
          >
            <i :class="kbToggle ? '' : actionCtrls[aKey].icon">
              {{ kbToggle ? actionCtrls[aKey].keybind : "" }}
            </i>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import SwitchButton from "@/components/SwitchButton.vue";
export default {
  name: "ActionControls",
  props: {
    actionCtrls: Object
  },
  components: {
    SwitchButton
  },
  data() {
    return {
      kbToggle: false
    };
  }
};
</script>
<style lang="scss">
@import "@/assets/styles/variables.scss";
#action-ctrls {
  user-select: none;
  .crtl-container {
    background-color: rgba($nav-bg, 0.3);
    border-radius: 0.35em;
    margin-top: 1em;
    margin-bottom: 1em;
    text-align: center;
    .head-container {
      display: grid;
      grid-template-areas: ".  .  h  h  kt kt";
      grid-template-columns: repeat(6, 1fr);
      .h-item {
        grid-area: h;
        font-weight: bold;
      }
      .main-tr {
        grid-area: kt;
        font-size: 10px;
        font-weight: 300;
        text-align: right;
      }
    }

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
  }
}
</style>
