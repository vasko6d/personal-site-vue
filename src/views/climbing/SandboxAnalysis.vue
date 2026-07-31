<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchData, kebabToCap } from '@/utils/Utils'
import { useClimberManifestStore } from '@/stores/useClimberManifestStore'
import ClimberAnalysis from '@/components/climbing/ClimberAnalysis.vue'
import ClimberSelect from '@/components/climbing/ClimberSelect.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const props = defineProps<{
  sandboxId: string
}>()

const ascents = ref<Record<string, unknown>[]>([])
const loading = ref(true)
const manifestStore = useClimberManifestStore()
manifestStore.fetchAll()

// Prefer the manifest's userName - it resolves correctly even for a
// zero-ascent scorecard (no ascents[0] to read). Fall back to the fetched
// scorecard's own first ascent (e.g. manifest hasn't loaded/doesn't have
// this slug yet), then to a kebab-to-title-case rendering of the URL param
// as a last resort so the page title is never blank.
const climberName = computed(() => {
  const entry = manifestStore.findBySlug(props.sandboxId)
  if (entry) return entry.userName
  const firstAscent = ascents.value[0] as { userName?: string } | undefined
  if (firstAscent?.userName) return firstAscent.userName
  return kebabToCap(props.sandboxId)
})

setTimeout(() => {
  fetchData(props.sandboxId)
    .then((result) => {
      console.log('fetched', result)
      ascents.value = (result as { ascents: Record<string, unknown>[] }).ascents
      loading.value = false
    })
    .catch((error) => {
      window.alert(error.msg || error)
    })
}, 250)
</script>

<template>
  <div id="ticklist-analysis">
    <div class="flex-row">
      <div class="chart bg1">
        <ClimberSelect :linkToJsonAnalysis="true" baseURL="/climbing/analytics/" />
      </div>
    </div>
    <div v-if="loading">
      <LoadingSpinner :size="64" />
      <div>Fetching Data...</div>
    </div>
    <div v-else>
      <ClimberAnalysis :climberName="climberName" :rawAscents="ascents"></ClimberAnalysis>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
