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

// Materializes one dynamic chart's data/opts, given the current-filters-
// applied Stat tree (what both climbing stores expose as
// currentFilteredStat) - adapted from ClimberAnalysis.vue's former local
// createChart(), which called stat.getFiltered(statBase, opts.filters) on
// the *root* tree. Since opts.filters is always the same reference as the
// currentFilters that already produced the filtered tree passed in here,
// re-walking those filter categories a second time is redundant - drilling
// into statBase on the already-filtered tree (via .getFiltered(statBase),
// no filters arg) reaches the exact same node. This matches the pattern
// AscentView.vue already used (props.stats.get(props.chart.statBase)) for
// the same reason. opts.filters itself is still read directly elsewhere
// (getGradeChartData's type==='redpoint'/'flash'/'onsite' branches, and
// ChartHandler.vue's showChart), so it must still be set on the config -
// just no longer needed as an argument here.
//
// Pure function (no component/store state) so it can be called once per
// chart instance (ChartHandler.vue) instead of once per filter change for
// every chart in one shared computed. Doesn't mutate any Pinia state itself
// - opts.chartOpts/opts.colors are pre-established (and markRaw'd) by
// addDynamicChart before this ever runs, so Chart.js's own internal
// mutation of the options object it's handed, and getPieChartData's
// incremental population of opts.colors below, both happen on plain,
// non-reactive objects, never a Vue reactive Proxy.
export function buildDynamicChart(
  filteredStat: Stat,
  statBase: string,
  config: DynamicChartConfig,
): Chart {
  const { type: chartType, opts } = config
  const stat = filteredStat.getFiltered(statBase)
  const dynamicChart: Chart = {
    type: chartType,
    title: opts.title || prettyCapitalize(statBase) + ' Chart',
    statBase: statBase,
    opts: opts,
    chartOpts: opts.chartOpts!,
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
      // opts.colors (pre-established by addDynamicChart) gets grown in
      // place by getPieChartData itself as it encounters new labels, so
      // colors stay stable across re-sorts/re-filters with no extra work
      // needed here.
      dynamicChart.chartData = getPieChartData(stat, opts)
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
