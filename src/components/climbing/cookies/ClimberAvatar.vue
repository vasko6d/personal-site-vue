<script setup lang="ts">
import { computed } from 'vue'
import { getDistinctColor } from '@/utils/Utils'
import { useClimberManifestStore } from '@/stores/useClimberManifestStore'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
  }>(),
  { size: 40 },
)

const manifestStore = useClimberManifestStore()
// Always mounted after the parent page's fetchAll() has already resolved
// the manifest, but call defensively in case this is ever reused somewhere
// that doesn't guarantee that ordering.
manifestStore.fetchAll()

// Deterministic placeholder avatar: initials + a color from the same
// distinct-color palette used for chart series, keyed by the climber's
// index in the manifest's stable (hide-independent) slug order so a
// climber's color stays consistent across this page and any chart that also
// colors by climber. Deliberately not using the real userAvatar CDN photo
// URLs present in the raw 8a.nu export - climber names in this app are
// already pseudonymized, and a real photo would undo that.
const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return [...parts[0]!].slice(0, 2).join('').toUpperCase()
  }
  return parts
    .slice(0, 2)
    .map((part) => [...part][0] ?? '')
    .join('')
    .toUpperCase()
})

const color = computed(() => {
  const index = manifestStore.allClimbers.findIndex((c) => c.userName === props.name)
  return getDistinctColor(index >= 0 ? index : 0)
})
</script>

<template>
  <div
    class="climber-avatar"
    :style="{
      width: size + 'px',
      height: size + 'px',
      backgroundColor: color,
      fontSize: Math.round(size * 0.4) + 'px',
    }"
    :title="name"
  >
    {{ initials }}
  </div>
</template>

<style scoped>
.climber-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  flex-shrink: 0;
  user-select: none;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
}
</style>
