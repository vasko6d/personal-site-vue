<script setup lang="ts">
import ClimberAvatar from './ClimberAvatar.vue'
import { formatClimberName } from '@/utils/Utils'
import type { LeaderboardEntry } from '@/utils/Cookies'

withDefaults(
  defineProps<{
    holder: LeaderboardEntry | undefined
    label?: string
  }>(),
  { label: 'Current Cookie Holder' },
)

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="cookie-holder-banner bg1"
    :class="{ clickable: holder }"
    role="button"
    :tabindex="holder ? 0 : -1"
    @click="holder && emit('click')"
    @keydown.enter="holder && emit('click')"
  >
    <template v-if="holder">
      <ClimberAvatar :name="holder.climber" :size="72" />
      <div class="holder-info">
        <div class="holder-label">{{ label }}</div>
        <div class="holder-name b">{{ formatClimberName(holder.climber) }}</div>
        <div class="holder-total">{{ holder.total }} cookies</div>
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
  &.clickable {
    cursor: pointer;
  }
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
