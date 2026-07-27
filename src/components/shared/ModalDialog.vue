<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    size?: 'default' | 'wide'
  }>(),
  { size: 'default' },
)

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
    <div class="modal-mask">
      <!-- @click.self lives here, not on .modal-mask: .modal-wrapper is a
           display:table-cell that fills the entire mask, so a backdrop click's
           event.target is always .modal-wrapper (or a .modal-container
           descendant), never .modal-mask itself - .self would never fire up
           there. .modal-container doesn't fill its wrapper, so a real
           backdrop click correctly self-matches here. -->
      <div class="modal-wrapper" @click.self="emit('close')">
        <div
          class="modal-container"
          :style="props.size === 'wide' ? { maxWidth: 'min(90vw, 900px)' } : undefined"
        >
          <i class="fas fa-window-close icn modal-close-btn" @click="emit('close')"></i>
          <div class="modal-header">
            <slot name="header">
              <h2>{{ title }}</h2>
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

// Pinned top-right regardless of what the header slot contains (default
// title or a fully custom header) - scoped to this component only, so the
// other pre-existing one-off .modal-mask users elsewhere in the app (which
// don't use ModalDialog) are unaffected by position:relative here.
.modal-container {
  position: relative;
}
.modal-close-btn {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  cursor: pointer;
}
</style>
