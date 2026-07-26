<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
  }>(),
  {
    size: 64,
  },
);
</script>

<template>
  <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }"></div>
</template>

<style scoped>
.spinner {
  display: inline-block;
  border-radius: 50%;
  border: 0.15em solid rgba(128, 128, 128, 0.3);
  border-top-color: currentColor;
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
