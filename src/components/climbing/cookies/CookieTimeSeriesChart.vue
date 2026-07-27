<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import LineGraph from '@/components/charts/LineGraph.vue'
import { getDistinctColor } from '@/utils/Utils'
import { importedClimbers } from '@/data/importedClimbers'
import type { CookieTimeSeriesEntry } from '@/utils/Cookies'

const props = withDefaults(
  defineProps<{
    series: CookieTimeSeriesEntry[]
    timeUnit?: 'day' | 'month'
  }>(),
  { timeUnit: 'month' },
)

function colorFor(climber: string): string {
  const index = importedClimbers.findIndex((c) => c.name === climber)
  return getDistinctColor(index >= 0 ? index : 0)
}

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
    }
  }) as unknown as ChartData<'line'>['datasets'],
}))

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  // 'index' + intersect:false shows every series' value at the hovered
  // x-position in one combined tooltip, rather than just the nearest point.
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      type: 'time',
      time: { unit: props.timeUnit },
      title: { display: false },
    },
    y: {
      min: 0,
      title: { display: true, text: 'Cookies' },
    },
  },
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { mode: 'index', intersect: false },
    // No zoom/pan on this chart - chartjs-plugin-zoom is disabled by default
    // for any chart that simply omits the `zoom` plugin key.
  },
}))
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
