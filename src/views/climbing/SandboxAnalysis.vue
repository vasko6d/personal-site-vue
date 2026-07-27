<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchData, kebabToCap } from '@/utils/Utils'
import ClimberAnalysis from '@/components/climbing/ClimberAnalysis.vue'
import ClimberSelect from '@/components/climbing/ClimberSelect.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const props = defineProps<{
  sandboxId: string
}>()

const ascents = ref<Record<string, unknown>[]>([])
const loading = ref(true)

const climberName = computed(() => kebabToCap(props.sandboxId))

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
@import '@/assets/styles/wrapper.scss';
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
