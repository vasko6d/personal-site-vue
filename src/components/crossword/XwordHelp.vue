<template id="xword-help">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">
              <h2>
                Help&nbsp;
                <i class="fas fa-window-close" @click="$emit('close')"></i>
              </h2>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">This is the help body</slot>
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
  name: "XwordHelpModal"
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/modal-shared.scss";
</style>