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

// Each climber's series only has a point on dates *they* sent something, so
// with differing lengths/dates across series, an index-based tooltip mode
// can show mismatched or missing entries. Re-map every series onto the
// shared union of all x-values, forward-filling gaps with that climber's
// last-known value (0 before their first point) - once every dataset has a
// point at every shared x-position, the combined tooltip naturally includes
// all of them, correct by construction rather than relying on chart.js's
// interaction-mode behavior for sparse/misaligned time series.
function alignSeries(series: CookieTimeSeriesEntry[]): CookieTimeSeriesEntry[] {
  const allTimes = [...new Set(series.flatMap((s) => s.points.map((p) => p.x.getTime())))].sort(
    (a, b) => a - b,
  )
  return series.map((s) => {
    const sorted = [...s.points].sort((a, b) => a.x.getTime() - b.x.getTime())
    let idx = 0
    let lastY = 0
    const aligned = allTimes.map((t) => {
      while (idx < sorted.length && sorted[idx]!.x.getTime() <= t) {
        lastY = sorted[idx]!.y
        idx++
      }
      return { x: new Date(t), y: lastY }
    })
    return { climber: s.climber, points: aligned }
  })
}

const alignedSeries = computed(() => alignSeries(props.series))

const chartData = computed<ChartData<'line'>>(() => ({
  datasets: alignedSeries.value.map((entry) => {
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
      // tooltipFormat is date-only (date-fns tokens, via
      // chartjs-adapter-date-fns) - every point's time-of-day is a fixed
      // noon-UTC artifact of Cookies.ts's date-string convention, not
      // meaningful data, so it shouldn't show in the tooltip.
      time: { unit: props.timeUnit, tooltipFormat: 'MMM d, yyyy' },
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
