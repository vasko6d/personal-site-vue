<script setup lang="ts">
import ClimberAvatar from './ClimberAvatar.vue'
import type { LeaderboardEntry } from '@/utils/Cookies'

defineProps<{
  holder: LeaderboardEntry | undefined
}>()
</script>

<template>
  <div class="cookie-holder-banner bg1">
    <template v-if="holder">
      <ClimberAvatar :name="holder.climber" :size="72" />
      <div class="holder-info">
        <div class="holder-label">Current Cookie Holder</div>
        <div class="holder-name b">{{ holder.climber }}</div>
        <div class="holder-total">{{ holder.total.toFixed(1) }} cookies</div>
      </div>
    </template>
    <div v-else class="holder-empty">No sends yet - go climb something!</div>
  </div>
</template>

<style lang="scss" scoped>
.cookie-holder-banner {
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 1em 1.5em;
  margin-bottom: 1em;
  .holder-info {
    text-align: left;
    .holder-label {
      font-size: 0.85em;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .holder-name {
      font-size: 1.4em;
    }
    .holder-total {
      font-size: 1.1em;
    }
  }
}
</style>
