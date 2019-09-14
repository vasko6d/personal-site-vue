<template id="modal-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">
              <h2>
                {{ title }}&nbsp;
                <i class="fas fa-window-close" @click="$emit('close')"></i>
              </h2>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <template v-if="depth === 2">
                <div v-for="tKey in Object.keys(ctrls)" :key="tKey.id">
                  <h3>{{ tKey.replace(/^\w/, c => c.toUpperCase()) }}</h3>
                  <div
                    class="help-li"
                    v-for="cKey in Object.keys(ctrls[tKey])"
                    :key="cKey.id"
                  >
                    <span class="help-itm-title">
                      <i :class="ctrls[tKey][cKey].icon"></i>
                      :&nbsp;
                    </span>
                    {{
                      ctrls[tKey][cKey].desc +
                        ". You can also press the ['" +
                        ctrls[tKey][cKey].keybind +
                        "'] key"
                    }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div
                  class="help-li"
                  v-for="cKey in Object.keys(ctrls)"
                  :key="cKey.id"
                >
                  <span class="help-itm-title">
                    <i :class="ctrls[cKey].icon"></i>
                    :&nbsp;
                  </span>
                  {{
                    ctrls[cKey].desc +
                      ". You can also press the ['" +
                      ctrls[cKey].keybind +
                      "'] key"
                  }}
                </div>
              </template>
            </slot>
          </div>
          <div class="modal-footer">
            <slot name="footer">
              <h2>
                <i class="fas fa-check-square" @click="$emit('close')"></i>
              </h2>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "ControlHelpModal",
  props: {
    title: String,
    ctrls: Object,
    depth: Number
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/dark-theme.scss";
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 500px;
  max-height: 400px;
  margin: 0px auto;
  padding: 20px 30px;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  overflow-y: scroll;
  i {
    cursor: pointer;
  }
}

.modal-header {
  h2 {
    margin-top: 0;
  }
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}
.help-itm-title {
  font-size: 18px;
  font-weight: 700;
}
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
