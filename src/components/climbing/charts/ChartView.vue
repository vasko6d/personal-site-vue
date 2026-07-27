<script setup lang="ts">
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import BarGraph from '@/components/charts/BarGraph.vue'
import type { Chart } from '../types'

defineProps<{
  chart: Chart
}>()
</script>

<template>
  <div>
    <div v-if="chart.subtitle">{{ chart.subtitle }}</div>
    <div v-if="chart.opts.aggregateFxn != null">
      {{ chart.opts.aggregateTitle }}
    </div>
    <div v-if="chart.type === 'pie'" class="chart-canvas-box">
      <DoughnutChart :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
    <div v-else-if="chart.type === 'grade' || chart.type === 'bar'" class="chart-canvas-box">
      <BarGraph :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
  </div>
</template>

<style scoped>
/* gives BarGraph/DoughnutChart's chart-canvas-wrapper (position:relative,
   height:100%) something concrete to fill - Chart.js's maintainAspectRatio:
   false needs a stable, defined-height ancestor to size against */
.chart-canvas-box {
  position: relative;
  height: 300px;
}
</style>
