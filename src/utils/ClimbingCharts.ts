import type { ChartOptions } from 'chart.js'
import Stat from '@/utils/Stat'
import { prettyCapitalize, formatString, getPieChartData, getGradeChartData } from '@/utils/Utils'
import type { Chart, DynamicChartConfig } from '@/components/climbing/types'

export function defaultChartOpts(): Record<string, unknown> {
  return {
    responsive: true,
    // fills the chart-canvas-box container's height (see ChartView.vue)
    // instead of Chart.js's default width/aspectRatio-derived height
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      legend: { display: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  } satisfies ChartOptions<'bar'>
}

// Materializes one dynamic chart's data/opts from the root Stat tree -
// ported verbatim from ClimberAnalysis.vue's former local createChart()
// (including the same stat.getFiltered(statBase, opts.filters) call - opts
// .filters is also read directly elsewhere, by getGradeChartData's
// type==='redpoint'/'flash'/'onsite' branches and by ChartHandler.vue's
// showChart, so it must already be set on the config, not just used to
// narrow the stat here). Pure function (no component/store state) so it can
// be called once per chart instance (ChartHandler.vue) instead of once per
// filter change for every chart in one shared computed.
export function buildDynamicChart(rootStat: Stat, statBase: string, config: DynamicChartConfig): Chart {
  const { type: chartType, opts } = config
  const stat = rootStat.getFiltered(statBase, opts.filters)
  const dynamicChart: Chart = {
    type: chartType,
    title: opts.title || prettyCapitalize(statBase) + ' Chart',
    statBase: statBase,
    opts: opts,
    chartOpts: opts.chartOpts || defaultChartOpts(),
    chartData: { datasets: [], labels: [], names: [] },
  }
  ;(dynamicChart.chartOpts as Record<string, unknown>).splitStat = !!opts.splitStat
  if (opts.splitStat) {
    dynamicChart.chartOpts.scales = {
      x: { stacked: true },
      y: { stacked: true },
    }
  }
  if (opts.subtitleFxn) {
    dynamicChart.subtitle = opts.subtitleFxn(stat)
  } else if (opts.autoGenerateSubtitle) {
    dynamicChart.subtitle =
      stat.count +
      ' Ascents, ' +
      stat.subStatCount() +
      ' ' +
      prettyCapitalize(statBase) +
      's' +
      (opts.limit ? ', Top ' + opts.limit : '') +
      (opts.splitStat ? `, Split(${opts.splitLimit}) on '${prettyCapitalize(opts.splitStat)}'` : '')
  }
  switch (chartType) {
    case 'bar':
    case 'pie': {
      dynamicChart.chartData = getPieChartData(stat, opts)
      // Save the original colors in a color map and persist them to prevent new random ones being assigned
      const firstDataset = dynamicChart.chartData.datasets[0]
      opts.colors =
        opts.colors ||
        ((firstDataset?.backgroundColor as string[] | undefined)?.reduce(
          (colorMap: Record<string, string>, field, index) => {
            colorMap[dynamicChart.chartData.labels[index]!] = field
            return colorMap
          },
          {},
        ) ??
          {})
      // Disable legend on pie if more than 20 entries
      const plugins = ((dynamicChart.chartOpts.plugins as Record<string, unknown>) ??= {})
      plugins.legend = {
        display:
          !!opts.splitStat || (chartType === 'pie' && dynamicChart.chartData.labels.length < 8),
      }
      break
    }
    case 'grade':
      dynamicChart.chartData = getGradeChartData(stat, true, opts)
      break
    default:
      console.warn(formatString('Chart Type [{}], not supported on dynamic charts', chartType))
  }
  return dynamicChart
}
