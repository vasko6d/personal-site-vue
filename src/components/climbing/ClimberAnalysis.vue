<script setup lang="ts">
import { ref, onUpdated } from 'vue'
import Aggregate from '@/utils/Aggregate'
import { useClimberAnalysisStore } from '@/stores/useClimberAnalysisStore'
import { defaultChartOpts } from '@/utils/ClimbingCharts'
import type { ProcessedAscent } from '@/utils/Utils'
import ChartHandler from '@/components/climbing/charts/ChartHandler.vue'
import TimeSeriesChart from '@/components/climbing/charts/TimeSeriesChart.vue'
import StatFilter from '@/components/climbing/StatFilter.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ClimberAscentTable from '@/components/climbing/ClimberAscentTable.vue'
import ClimberColumnSelect from '@/components/climbing/ClimberColumnSelect.vue'
import type { ClimberStat } from '@/stores/climbingShared'

const props = defineProps<{
  climberName: string
  rawAscents: Record<string, unknown>[]
}>()

defineEmits<{
  initialized: []
}>()

const store = useClimberAnalysisStore()

const showDynamicCharts = ref(true)
const showAscents = ref(false)
const loading = ref(true)
const tsIsOpen = ref(true)

function handleStatClick(stat: ClimberStat) {
  if (stat.dates) {
    stat.dates.forEach((date) => {
      console.log(date.date)
      date.ascents.forEach((a) => console.log(`\t > ${a.area}: V${a.grade} - ${a.name}`))
    })
  }
}

interface TooltipContextLike {
  dataset: { label?: string }
  parsed: { y: number }
  label: string
}

// Belt-and-suspenders from the original component: forces the spinner off
// on any update cycle, in case the setTimeout/try below doesn't reach its
// own loading.value = false for some reason. Dropped by mistake during the
// Pinia migration; restored as-is.
onUpdated(() => {
  loading.value = false
})

loading.value = true
setTimeout(() => {
  try {
    store.buildFromAscents(props.climberName, props.rawAscents)

    // Grade Counts
    const gradeOpts = defaultChartOpts()
    gradeOpts.scales = {
      x: { stacked: true },
      y: { stacked: true },
    }
    ;(gradeOpts.plugins as Record<string, unknown>).tooltip = {
      mode: 'index',
      callbacks: {
        label: (t: TooltipContextLike) => {
          return t.dataset.label + ': ' + t.parsed.y
        },
        title: (t: TooltipContextLike[]) => {
          return `${t[0]!.label} - (${t.reduce((pv, cv) => pv + cv.parsed.y, 0)})`
        },
      },
    }
    store.addDynamicChart('grade', 'grade', {
      title: 'Ascents per Grade',
      chartOpts: gradeOpts,
    })
    // Area Counts
    store.addDynamicChart('pie', 'area', {
      autoGenerateSubtitle: true,
    })
    // year counts
    store.addDynamicChart('bar', 'year', {
      sortByName: true,
      autoGenerateSubtitle: true,
    })
    // Most V Points Days
    store.addDynamicChart('bar', 'date', {
      sortByName: false,
      limit: 20,
      aggregateFxn: Aggregate.fxns.sum('grade'),
      aggOpts: {
        aggregator: 'sum',
        catagory: 'grade',
        value: null,
      },
      aggregateTitle: 'Highest V Point Days',
    })
    // Month
    store.addDynamicChart('bar', 'month', {
      sortByName: true,
      autoGenerateSubtitle: true,
    })
    // Softness, rating and recommend
    store.addDynamicChart('bar', 'rating', {
      sortByName: true,
    })
    store.initialized = true
    loading.value = false
  } catch (error) {
    window.alert((error as Error).message || error)
  }
}, 250)
</script>

<template>
  <div id="climber-analysis">
    <h1>{{ climberName }}'s Analysis</h1>
    <div v-if="loading">
      <LoadingSpinner :size="64" />
      <div>Analyzing...</div>
    </div>
    <div v-else>
      <div class="flex-row">
        <div class="chart bg1">
          <h2>Climber Stats</h2>
          <div class="flex-row">
            <table class="basic-table">
              <tr
                v-for="cStat in store.climberStatsSummary"
                :key="cStat.name"
                @click="handleStatClick(cStat)"
              >
                <td class="b">{{ cStat.name }}</td>
                <td>{{ cStat.value }}</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="chart bg1">
          <StatFilter
            :currentFilters="store.currentFilters"
            :stats="store.stats"
            @clearFilters="store.clearFilters"
          />
        </div>
      </div>
      <h2 class="icn" @click="showDynamicCharts = !showDynamicCharts">
        Dynamic Charts
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showDynamicCharts,
            'fa-angle-up': showDynamicCharts,
          }"
        ></i>
      </h2>
      <div v-if="showDynamicCharts">
        <div class="flex-row">
          <ChartHandler
            v-for="(config, index) in store.charts.dynamic"
            :key="index"
            :config="config"
            :stats="store.currentFilteredStat"
            @close="store.closeChart(index)"
            @changeChartType="store.changeChartType($event, index)"
            @changeAggregator="store.changeAggregator($event, index)"
            @changeBaseStat="store.changeBaseStat($event, index)"
            @changeSplitStat="store.changeSplitStat($event, index)"
            @changeSplitLimit="store.changeSplitLimit($event, index)"
            @changeSortOrder="store.changeSortOrder($event, index)"
            @changeLimit="store.changeLimit($event, index)"
          ></ChartHandler>
        </div>
        <div class="flex-row">
          <TimeSeriesChart
            v-if="
              store.currentFilteredStat &&
              store.currentFilteredStat.values.length > 0 &&
              store.initialized &&
              tsIsOpen
            "
            :stat="store.currentFilteredStat"
            :uniqueGrades="store.uniqueGrades"
            @close="tsIsOpen = false"
          ></TimeSeriesChart>
        </div>
      </div>
      <h2 class="icn" @click="showAscents = !showAscents">
        Ascents
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showAscents,
            'fa-angle-up': showAscents,
          }"
        ></i>
      </h2>
      <div v-if="showAscents">
        <div class="flex-row">
          <div class="chart bg1">
            <StatFilter
              :currentFilters="store.currentFilters"
              :stats="store.stats"
              :startExpanded="false"
              @clearFilters="store.clearFilters"
            />
          </div>
          <ClimberColumnSelect
            :columns="store.columns"
            :labelMap="store.headings"
            @toggleActive="
              store.columns[$event.index]!.active = !store.columns[$event.index]!.active
            "
          >
          </ClimberColumnSelect>
        </div>

        <ClimberAscentTable
          :columns="store.activeColumns"
          :values="store.currentFilteredStat.values as unknown as ProcessedAscent[]"
        ></ClimberAscentTable>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
#climber-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
