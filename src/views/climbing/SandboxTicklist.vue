<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Stat from '@/utils/Stat'
import { fetchData, preprocessAscent } from '@/utils/Utils'
import Timer from '@/utils/webgl/Timer'
import ClimberAscentTable from '@/components/climbing/ClimberAscentTable.vue'
import ClimberColumnSelect from '@/components/climbing/ClimberColumnSelect.vue'
import StatFilter from '@/components/climbing/StatFilter.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import { importedClimbers } from '@/data/importedClimbers'
import type { ColumnDef, StatFilterMap } from '@/components/climbing/types'
import type { ProcessedAscent } from '@/utils/Utils'

const loading = ref(true)
const loadingMessage = ref('Fetching Scorecards...')
const stats = ref(new Stat('ascents', ['comment']))

const currentFilters: StatFilterMap = reactive({
  climber: { val: null, show: true },
  area: { val: null, show: true },
  year: { val: null, show: true },
  month: { val: null, show: true },
  dayOfWeek: { val: null, show: false },
  recommend: { val: null, show: false },
  grade: { val: null, show: true },
  rating: { val: null, show: false },
  softness: { val: null, show: true },
  flags: { val: null, show: false },
  type: { val: null, show: true },
  subArea: { val: null, show: true },
  country: { val: null, show: false },
})

const columns = reactive<ColumnDef[]>([
  { name: 'climber', active: true },
  { name: 'date', active: true },
  { name: 'type', active: false },
  { name: 'grade', active: true },
  { name: 'name', active: true },
  { name: 'rating', active: true },
  { name: 'recommend', active: false },
  { name: 'area', active: true },
  { name: 'subArea', active: false },
  { name: 'flags', active: true },
  { name: 'comment', active: false },
])

const headings: Record<string, string> = {
  climber: 'Climber',
  date: 'Date',
  type: 'Type',
  grade: 'Grade',
  name: 'Name',
  rating: 'Stars',
  recommend: 'Recommend',
  area: 'Area',
  subArea: 'SubArea',
  flags: 'Flags',
  comment: 'Comment',
}

const activeColumns = computed(() => columns.filter((col) => col.active).map((col) => col.name))
const currentFilteredStat = computed(() => stats.value.getFiltered(undefined, currentFilters))

function fetchAllData() {
  setTimeout(() => {
    const promises: Promise<ProcessedAscent[]>[] = []
    const timer = new Timer(true)
    let fetchCount = 0
    importedClimbers.forEach((climber) => {
      promises.push(
        fetchData(climber.sandboxId).then((result) => {
          const ascents = (result as { ascents: Record<string, unknown>[] }).ascents.map((ascent) =>
            preprocessAscent(ascent as never, climber.name),
          )
          fetchCount++
          loadingMessage.value = `Fetching Scorecards ( ${fetchCount} / ${importedClimbers.length} )...`
          return Promise.resolve(ascents)
        }),
      )
    })
    Promise.all(promises).then((allAscents) => {
      loadingMessage.value = 'Processing Scorecards...'
      setTimeout(() => {
        const allAscentsFlat = ([] as ProcessedAscent[]).concat(...allAscents)
        stats.value.goDeeper(allAscentsFlat as unknown as Record<string, unknown>[])
        console.log(`[${timer.getTimeSec()}] All Ascents porcessed`)
        console.log('Ticklist: ', stats.value)
        loading.value = false
      }, 100)
    })
  }, 250)
}

function clearFilters(catToClear?: string) {
  if (catToClear) {
    currentFilters[catToClear] = { val: null, show: currentFilters[catToClear]!.show }
  } else {
    for (const cat of Object.keys(currentFilters)) {
      currentFilters[cat] = { val: null, show: currentFilters[cat]!.show }
    }
  }
}

loading.value = true
fetchAllData()
</script>

<template>
  <div id="boulder-scorecard">
    <h1>The Sandbox's Ticklist</h1>
    <div v-if="loading">
      <LoadingSpinner :size="64" />
      <div>{{ loadingMessage }}</div>
    </div>
    <div v-else class="flex-row">
      <div class="chart-w">
        <div class="chart-p bg1">
          <StatFilter
            :currentFilters="currentFilters"
            :stats="stats"
            :startExpanded="false"
            @clearFilters="clearFilters"
          />
        </div>
      </div>
      <ClimberColumnSelect
        :columns="columns"
        :labelMap="headings"
        @toggleActive="columns[$event.index]!.active = !columns[$event.index]!.active"
      >
      </ClimberColumnSelect>
    </div>
    <div v-show="!loading">
      <ClimberAscentTable
        :columns="activeColumns"
        :values="currentFilteredStat.values as unknown as ProcessedAscent[]"
      ></ClimberAscentTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/wrapper.scss';
@import '@/assets/styles/table-container.scss';
#boulder-scorecard {
  display: inline-block;
  max-width: 1400px;
  @media only screen and (max-width: 1400px) {
    max-width: 100%;
  }
  .left {
    text-align: left;
  }
  overflow-x: auto;
}
</style>
