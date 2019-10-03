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
@import "@/assets/styles/modal-shared.scss";
</style>
