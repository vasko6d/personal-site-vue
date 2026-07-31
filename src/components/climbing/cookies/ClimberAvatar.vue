<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatClimberName, getDistinctColor } from '@/utils/Utils'
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

const displayName = computed(() => formatClimberName(props.name))

// Real 8a.nu profile photo, when the climber has set one - falls back to
// the initials circle below for climbers still on 8a.nu's generic default
// photo, or if the real photo URL fails to load.
const manifestEntry = computed(() => manifestStore.findByUserName(props.name))
const imgFailed = ref(false)
watch(
  () => props.name,
  () => {
    imgFailed.value = false
  },
)
const avatarUrl = computed(() => {
  const url = manifestEntry.value?.userAvatar
  if (!url || url.includes('avatar_default.png') || imgFailed.value) return null
  return url
})

// Placeholder avatar (used when there's no real photo): initials + a color
// from the same distinct-color palette used for chart series, keyed by the
// climber's index in the manifest's stable (hide-independent) slug order so
// a climber's color stays consistent across this page and any chart that
// also colors by climber.
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
  <img
    v-if="avatarUrl"
    class="climber-avatar-img"
    :src="avatarUrl"
    :alt="displayName"
    :title="displayName"
    :style="{ width: size + 'px', height: size + 'px' }"
    @error="imgFailed = true"
  />
  <div
    v-else
    class="climber-avatar"
    :style="{
      width: size + 'px',
      height: size + 'px',
      backgroundColor: color,
      fontSize: Math.round(size * 0.4) + 'px',
    }"
    :title="displayName"
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
.climber-avatar-img {
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
</style>
