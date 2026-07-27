<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import LineGraph from '@/components/charts/LineGraph.vue'
import { getDistinctColor } from '@/utils/Utils'
import { importedClimbers } from '@/data/importedClimbers'
import type { CookieTimeSeriesEntry } from '@/utils/Cookies'

const props = defineProps<{
  series: CookieTimeSeriesEntry[]
}>()

function colorFor(climber: string): string {
  const index = importedClimbers.findIndex((c) => c.name === climber)
  return getDistinctColor(index >= 0 ? index : 0)
}

// The decay is a hard cliff now, not smooth exponential decay, so `stepped:
// 'after'` renders each climber's running total as the exact
// piecewise-constant step function computeCookieTimeSeries computes, rather
// than a misleading straight line between two very different values.
const chartData = computed<ChartData<'line'>>(() => ({
  datasets: props.series.map((entry) => {
    const color = colorFor(entry.climber)
    return {
      data: entry.points,
      label: entry.climber,
      borderColor: color,
      backgroundColor: color,
      pointBackgroundColor: color,
      pointBorderColor: color,
      borderWidth: 2,
      pointRadius: 2,
      fill: false,
      stepped: 'after',
    }
  }) as unknown as ChartData<'line'>['datasets'],
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: { unit: 'month' },
      title: { display: false },
    },
    y: {
      min: 0,
      title: { display: true, text: 'Cookies' },
    },
  },
  plugins: {
    legend: { position: 'bottom' },
    // No zoom/pan on this chart - chartjs-plugin-zoom is disabled by default
    // for any chart that simply omits the `zoom` plugin key.
  },
}
</script>

<template>
  <div class="cookie-time-series bg1">
    <LineGraph class="chart-container" :chartData="chartData" :options="options" />
  </div>
</template>

<style scoped>
.cookie-time-series {
  padding: 1em;
  margin-bottom: 1em;
  .chart-container {
    height: 400px;
  }
}
</style>
