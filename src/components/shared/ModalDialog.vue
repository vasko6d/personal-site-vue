<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()

// New behavior beyond the repo's existing one-off .modal-mask usages
// (ControlHelpModal.vue, XwordHelp/Settings/Tools.vue): none of those close
// on backdrop click or Escape - both are added here so every future modal
// gets them for free just by using this component.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- eslint-disable vue/require-toggle-inside-transition -->
  <transition name="modal">
    <div class="modal-mask" @click.self="emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">
              <h2>
                {{ title }}&nbsp;
                <i class="fas fa-window-close icn" @click="emit('close')"></i>
              </h2>
            </slot>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <!-- eslint-enable vue/require-toggle-inside-transition -->
</template>

<style lang="scss" scoped>
@use '@/assets/styles/modal-shared';
</style>
