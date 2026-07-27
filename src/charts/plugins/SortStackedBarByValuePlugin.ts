import type { BarProps, Chart, Plugin } from 'chart.js'

/*
 * Adapted from:
 *    https://stackoverflow.com/questions/51323890/chart-js-stacked-bar-chart-sorting-values-in-bar-by-value
 *
 * Chart.js has no built-in support for sorting the segments of a stacked bar
 * chart by value, so this plugin manually recomputes each stack's segment
 * baselines/heights so the largest value always renders on the bottom,
 * regardless of dataset order.
 *
 * Ported from the Chart.js 2 version, which mutated element `_model.y`/
 * `_model.base` - Chart.js 3+ removed the `_model` indirection, so element
 * geometry (x/y/base/width/height) is read/written directly on the element
 * instance instead. Assumes the stacked bar chart's vertical axis uses the
 * default scale id "y" (i.e. `scales: { y: { ... } }`, not a custom id).
 */

interface SortedSegment {
  datasetIndex: number
  hidden: boolean
  value: number
  y: number
  base: number
}

interface SplitStatOptions {
  splitStat?: boolean
}

const sortedDataByChart = new WeakMap<Chart, SortedSegment[][]>()

export const SortStackedBarByValue: Plugin<'bar'> = {
  id: 'sortStackedBarByValue',

  afterDatasetsUpdate(chart) {
    const sortedData = sortedDataByChart.get(chart)
    if (!(chart.options as SplitStatOptions).splitStat || !sortedData) return

    chart.data.datasets.forEach((_, datasetIndex) => {
      chart.getDatasetMeta(datasetIndex).data.forEach((element, index) => {
        const segment = sortedData[index]?.find((s) => s.datasetIndex === datasetIndex)
        if (!segment) return
        const bar = element as unknown as BarProps
        bar.y = segment.y
        bar.base = segment.base
      })
    })
  },

  beforeDraw(chart) {
    if (!(chart.options as SplitStatOptions).splitStat) {
      sortedDataByChart.delete(chart)
      return
    }

    const perIndexSegments: SortedSegment[][] = []
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      ;(dataset.data as unknown[]).forEach((value, index) => {
        if (!perIndexSegments[index]) perIndexSegments[index] = []
        const bar = meta.data[index] as unknown as BarProps
        perIndexSegments[index].push({
          datasetIndex,
          hidden: meta.hidden ?? false,
          value: value as number,
          y: bar.y ?? 0,
          base: bar.base,
        })
      })
    })

    const yScale = chart.scales.y
    if (!yScale) return
    const chartTop = yScale.top
    const max = yScale.max
    const heightPerUnit = yScale.height / max

    perIndexSegments.forEach((segments) => {
      segments.sort((a, b) => a.value - b.value)
      const visibleSum = segments.filter((s) => !s.hidden).reduce((sum, s) => sum + s.value, 0)
      const initialBase = chartTop + (max - visibleSum) * heightPerUnit
      segments.forEach((segment, i) => {
        segment.base =
          initialBase +
          segments.slice(0, i).reduce((sum, s) => sum + (s.hidden ? 0 : s.value * heightPerUnit), 0)
        segment.y = segment.base + segment.value * heightPerUnit
      })
    })

    sortedDataByChart.set(chart, perIndexSegments)
  },
}
