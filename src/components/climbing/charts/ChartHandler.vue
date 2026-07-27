<script setup lang="ts">
import { computed, ref } from 'vue'
import Stat from '@/utils/Stat'
import ChartView from './ChartView.vue'
import SettingView from './SettingView.vue'
import AscentView from './AscentView.vue'
import { buildDynamicChart } from '@/utils/ClimbingCharts'
import type { AggOpts, DynamicChartConfig } from '../types'

const props = defineProps<{
  config: DynamicChartConfig
  stats: Stat
}>()

const emit = defineEmits<{
  close: []
  changeChartType: [type: string]
  changeAggregator: [opts: AggOpts]
  changeBaseStat: [statBase: string]
  changeSplitStat: [splitStat: string | null]
  changeSplitLimit: [splitLimit: number]
  changeSortOrder: [sortByName: boolean]
  changeLimit: [limit: number]
}>()

const viewType = ref<'chart' | 'settings' | 'ascents'>('chart')

// Only materializes this chart's data - each ChartHandler instance has its
// own computed, so a setting change on one chart (or a filter change that
// only affects this chart's statBase) doesn't recompute its siblings, and a
// hidden chart (showChart false below) never gets built at all since `chart`
// is only read inside the v-if="showChart" branch of the template.
const chart = computed(() => buildDynamicChart(props.stats, props.config.statBase, props.config))

const showChart = computed(() => {
  const opts = props.config.opts
  return !(
    (opts.filters &&
      opts.filters[props.config.statBase] &&
      opts.filters[props.config.statBase]!.val) ||
    opts.hideChart
  )
})

function chartView() {
  viewType.value = 'chart'
}
</script>

<template>
  <div class="chart bg1" v-if="showChart">
    <div>
      <div class="chart-header">
        <span>
          <i
            class="fas fa-mountain icn"
            :class="{ 'icn-a': viewType === 'ascents' }"
            @click="viewType = 'ascents'"
            v-tooltip="'Show Ascents'"
          ></i
          >|
        </span>
        <span v-if="chart.type != 'grade'">
          <i
            class="fas fa-cogs icn"
            :class="{ 'icn-a': viewType === 'settings' }"
            @click="viewType = 'settings'"
            v-tooltip="'Settings'"
          ></i
          >|
        </span>
        <span>
          <i
            class="fas icn"
            :class="{
              'fa-chart-line': chart.type === 'line',
              'fa-chart-pie': chart.type === 'pie',
              'fa-chart-bar': chart.type === 'bar' || chart.type === 'grade',
              'icn-a': viewType === 'chart',
            }"
            @click="viewType = 'chart'"
            v-tooltip="'Show Chart'"
          ></i>
        </span>
        <span class="middle"></span>
        <i class="fas fa-window-close icn" @click="emit('close')" v-tooltip="'Discard Chart'"></i>
      </div>
    </div>
    <h2>{{ chart.title }}</h2>
    <ChartView v-show="viewType === 'chart'" :chart="chart" />
    <SettingView
      v-if="viewType === 'settings'"
      :chart="chart"
      :stats="stats"
      @changeChartType="(emit('changeChartType', $event), chartView())"
      @changeAggregator="(emit('changeAggregator', $event), chartView())"
      @changeBaseStat="(emit('changeBaseStat', $event), chartView())"
      @changeSplitStat="(emit('changeSplitStat', $event), chartView())"
      @changeSplitLimit="(emit('changeSplitLimit', $event), chartView())"
      @changeSortOrder="(emit('changeSortOrder', $event), chartView())"
      @changeLimit="(emit('changeLimit', $event), chartView())"
    />
    <AscentView v-else-if="viewType === 'ascents'" :chart="chart" :stats="stats" />
  </div>
</template>

<style lang="scss" scoped>
.chart-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  .middle {
    flex-grow: 1;
    flex-basis: 10px;
  }
}
.setting-select {
  width: 90%;
}
</style>
