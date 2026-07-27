<script setup lang="ts">
import { computed, reactive, ref, onUpdated } from 'vue'
import type { ChartOptions } from 'chart.js'
import Stat from '@/utils/Stat'
import Aggregate from '@/utils/Aggregate'
import {
  preprocessAscent,
  prettyCapitalize,
  vScale,
  mapGrade,
  formatString,
  getPieChartData,
  getGradeChartData,
} from '@/utils/Utils'
import type { ProcessedAscent } from '@/utils/Utils'
import ChartHandler from '@/components/climbing/charts/ChartHandler.vue'
import TimeSeriesChart from '@/components/climbing/charts/TimeSeriesChart.vue'
import StatFilter from '@/components/climbing/StatFilter.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ClimberAscentTable from '@/components/climbing/ClimberAscentTable.vue'
import ClimberColumnSelect from '@/components/climbing/ClimberColumnSelect.vue'
import type { AggOpts, Chart, ColumnDef, DynamicChartConfig, StatFilterMap } from './types'

const props = defineProps<{
  climberName: string
  rawAscents: Record<string, unknown>[]
}>()

defineEmits<{
  initialized: []
}>()

const showDynamicCharts = ref(true)
const showAscents = ref(false)
const ascents = ref<ProcessedAscent[]>([])
const charts = reactive<{ adhoc: unknown[]; dynamic: DynamicChartConfig[] }>({
  adhoc: [],
  dynamic: [],
})

const currentFilters: StatFilterMap = reactive({
  area: { val: null, show: true },
  year: { val: null, show: true },
  month: { val: null, show: true },
  dayOfWeek: { val: null, show: false },
  recommend: { val: null, show: true },
  grade: { val: null, show: true },
  rating: { val: null, show: false },
  softness: { val: null, show: true },
  flags: { val: null, show: false },
  type: { val: null, show: true },
  subArea: { val: null, show: true },
  country: { val: null, show: false },
})

const stats = ref(new Stat('ascents', ['comment']))
const initialized = ref(false)
const loading = ref(true)
const tsIsOpen = ref(true)

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

const uniqueGrades = computed(() => {
  const uniqueGradeSet = new Set(
    (currentFilteredStat.value.values as unknown as ProcessedAscent[]).map(
      (el) => mapGrade(el.grade, 0) as number,
    ),
  )
  return Array.from(uniqueGradeSet)
})

const currentFilteredStat = computed(() => stats.value.getFiltered(undefined, currentFilters))

function createChart(chartType: string, statBase: string, opts: DynamicChartConfig['opts']): Chart {
  const stat = stats.value.getFiltered(statBase, opts.filters)
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

const computedCharts = computed<Chart[]>(() => {
  // The dynamic part of "dynamic charts"
  const compCharts: Chart[] = []
  for (const dChart of charts.dynamic) {
    dChart.opts.filters = currentFilters
    compCharts.push(createChart(dChart.type, dChart.statBase, dChart.opts))
  }
  return compCharts
})

interface DoubleEntry {
  date: string
  ascents: ProcessedAscent[]
}

interface ClimberStat {
  name: string
  value: string | number | undefined
  dates?: DoubleEntry[]
}

const climberStats = computed<ClimberStat[]>(() => {
  const stat = currentFilteredStat.value
  const cStats: ClimberStat[] = [{ name: 'Total Ascents', value: stat.count }]
  if (initialized.value) {
    const da = dateAnalysis(stat)
    const a = ascentAnalysis(stat, 20)
    cStats.push({ name: 'Boulderer Score', value: vScale(a.grade.score) })
    cStats.push({ name: 'Average Stars', value: a.star.avg })
    cStats.push({ name: 'Recommend %', value: a.star.recommend + '%' })
    Object.keys(a.grade.dubMap)
      .sort()
      .forEach((key) => {
        const count = a.grade.dubMap[Number(key)]!.length
        let name = `${key}x`
        if (key == '2') {
          name = 'Double'
        } else if (key == '3') {
          name = 'Triple'
        }
        name += ' Double'
        cStats.push({
          name,
          value: `${count}`,
          dates: a.grade.dubMap[Number(key)],
        })
      })
    cStats.push({ name: 'Average Comment', value: a.comment.avgLen + ' characters' })
    cStats.push({ name: 'Earliest', value: da.firstDate })
    cStats.push({ name: 'Most Recent', value: da.mostRecent })
    cStats.push({ name: 'Days climbed', value: da.count })
    cStats.push({
      name: 'Grade [Max, Avg]',
      value: [vScale(a.grade.max), vScale(a.grade.avg)].join(', '),
    })
  }
  return cStats
})

function handleStatClick(stat: ClimberStat) {
  if (stat.dates) {
    stat.dates.forEach((date) => {
      console.log(date.date)
      date.ascents.forEach((a) => console.log(`\t > ${a.area}: V${a.grade} - ${a.name}`))
    })
  }
}

function closeChart(chart: Chart) {
  chart.opts.hideChart = true
}

function changeChartType(type: string, chartIndex: number) {
  charts.dynamic[chartIndex]!.type = type
}

function changeSortOrder(sortByName: boolean, chartIndex: number) {
  charts.dynamic[chartIndex]!.opts.sortByName = sortByName
}

function changeLimit(limit: number, chartIndex: number) {
  charts.dynamic[chartIndex]!.opts.limit = limit
}

function changeBaseStat(newBaseStat: string, chartIndex: number) {
  changeSplitStat(null, chartIndex)
  charts.dynamic[chartIndex]!.statBase = newBaseStat
  delete charts.dynamic[chartIndex]!.opts.colors
}

function changeAggregator(opts: AggOpts, chartIndex: number) {
  const dynOpts = charts.dynamic[chartIndex]!.opts
  if (opts.aggregator === null) {
    delete dynOpts.aggregateFxn
    delete dynOpts.aggregateTitle
    delete dynOpts.aggOpts
  } else {
    const agg = Aggregate.fxns[opts.aggregator](opts.catagory as string, opts.value ?? undefined)
    dynOpts.aggregateFxn = agg
    dynOpts.aggOpts = opts
    dynOpts.aggregateTitle = Aggregate.makeTitle(
      opts.aggregator,
      opts.catagory as string,
      opts.value ?? undefined,
    )
  }
}

function changeSplitStat(newSplitStat: string | null, chartIndex: number) {
  // TODO: need to address aggregators better when using a split stat...
  // May have to aggregate the stat before splitting to sort right
  if (!newSplitStat) changeSplitLimit(2, chartIndex)
  charts.dynamic[chartIndex]!.type = 'bar'
  charts.dynamic[chartIndex]!.opts.splitStat = newSplitStat
}

function changeSplitLimit(newSplitLimit: number, chartIndex: number) {
  charts.dynamic[chartIndex]!.opts.splitLimit = newSplitLimit
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

function dateAnalysis(stat: Stat) {
  const dates = Object.keys(stat.get('date').subStats)
  dates.sort()
  return {
    firstDate: dates[0],
    mostRecent: dates[dates.length - 1],
    count: dates.length,
  }
}

function ascentAnalysis(stat: Stat, ntop = 10) {
  const ascents = stat.values as unknown as ProcessedAscent[]
  const a = {
    grade: {
      max: 0 as number | string,
      min: 0,
      avg: 0,
      score: 0,
      dubMap: {} as Record<number, DoubleEntry[]>,
    },
    star: {
      avg: 0,
      recommend: 0,
    },
    comment: {
      avgLen: 0,
    },
    softness: 0,
  }
  if (ascents.length === 0) {
    return a
  }
  ascents.sort((a, b) => (mapGrade(b.grade) as number) - (mapGrade(a.grade) as number))
  a.grade.max = ascents[0]!.grade
  a.grade.min = Math.max(Number(ascents[ascents.length - 1]!.grade), 0)
  // Average and Boulder Rating
  let sum = 0
  let starSum = 0
  let topCount = 0
  let topTotal = 0
  let numRecommend = 0
  let totalCommentLen = 0
  let hard = 0
  let soft = 0
  const dateMap: Record<string, ProcessedAscent[]> = {}
  for (const ascent of ascents) {
    const grade = mapGrade(ascent.grade, 0) as number
    sum += grade
    starSum += Number(ascent.rating)
    if (topCount < ntop) {
      topTotal += mapGrade(ascent.grade, 0) as number
      topCount++
    }
    totalCommentLen += ascent.commentLength
    numRecommend += ascent.recommend ? 1 : 0
    soft += ascent.softness === 'Soft' ? 1 : 0
    hard += ascent.softness === 'Hard' ? 1 : 0

    // Count the doubles send in a single date
    if (grade >= 10) {
      if (ascent.date in dateMap) {
        dateMap[ascent.date]!.push(ascent)
      } else {
        dateMap[ascent.date] = [ascent]
      }
    }
  }

  // Calculate Double Double / Triple Double
  Object.keys(dateMap).forEach((date) => {
    const dateAscents = dateMap[date]!
    if (dateAscents.length > 1) {
      if (dateAscents.length in a.grade.dubMap) {
        a.grade.dubMap[dateAscents.length]!.push({ date, ascents: dateAscents })
      } else {
        a.grade.dubMap[dateAscents.length] = [{ date, ascents: dateAscents }]
      }
    }
  })

  a.grade.avg = Math.round((10 * sum) / ascents.length) / 10
  a.star.avg = Math.round((10 * starSum) / ascents.length) / 10
  a.star.recommend = Math.round((100 * numRecommend) / ascents.length)
  a.grade.score = Math.round((10 * topTotal) / topCount) / 10
  a.softness = (soft - hard) / ascents.length
  a.softness = 5 + Math.round(50 * a.softness) / 10
  a.comment.avgLen = Math.round(totalCommentLen / ascents.length)

  console.log('Ascent Analysis: ', a)

  return a
}

function defaultChartOpts(): Record<string, unknown> {
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

function initializeStats(): Promise<void> {
  ascents.value = props.rawAscents.map((ascent) =>
    preprocessAscent(ascent as never, props.climberName),
  )
  const s = new Stat('ascents', ['comment'])
  s.goDeeper(ascents.value as unknown as Record<string, unknown>[])
  console.log('Analytics: ', s)
  stats.value = s
  return Promise.resolve()
}

function addDynamicChart(
  chartType: string,
  statBase: string,
  opts: DynamicChartConfig['opts'] = {},
) {
  // Default opts with must be defined.
  opts.sortByName = opts.sortByName || false
  opts.limit = opts.limit || 0
  opts.splitStat = opts.splitStat || null
  opts.splitLimit = opts.splitLimit || 2
  // Create chart
  const dynamicChart: DynamicChartConfig = {
    type: chartType,
    statBase: statBase,
    opts: opts,
  }
  charts.dynamic.push(dynamicChart)
}

interface TooltipContextLike {
  dataset: { label?: string }
  parsed: { y: number }
  label: string
}

onUpdated(() => {
  loading.value = false
})

loading.value = true
setTimeout(() => {
  initializeStats()
    .then(() => {
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
      addDynamicChart('grade', 'grade', {
        title: 'Ascents per Grade',
        chartOpts: gradeOpts,
      })
      // Area Counts
      addDynamicChart('pie', 'area', {
        autoGenerateSubtitle: true,
      })
      // year counts
      addDynamicChart('bar', 'year', {
        sortByName: true,
        autoGenerateSubtitle: true,
      })
      // Most V Points Days
      addDynamicChart('bar', 'date', {
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
      addDynamicChart('bar', 'month', {
        sortByName: true,
        autoGenerateSubtitle: true,
      })
      // Softness, rating and recommend
      addDynamicChart('bar', 'rating', {
        sortByName: true,
      })
      initialized.value = true
      loading.value = false
    })
    .catch((error) => {
      window.alert(error.msg || error)
    })
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
              <tr v-for="cStat in climberStats" :key="cStat.name" @click="handleStatClick(cStat)">
                <td class="b">{{ cStat.name }}</td>
                <td>{{ cStat.value }}</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="chart bg1">
          <StatFilter
            :currentFilters="currentFilters"
            :stats="stats"
            @clearFilters="clearFilters"
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
            v-for="(dynamicChart, index) in computedCharts"
            :key="index"
            :chart="dynamicChart"
            :stats="currentFilteredStat"
            @close="closeChart(dynamicChart)"
            @changeChartType="changeChartType($event, index)"
            @changeAggregator="changeAggregator($event, index)"
            @changeBaseStat="changeBaseStat($event, index)"
            @changeSplitStat="changeSplitStat($event, index)"
            @changeSplitLimit="changeSplitLimit($event, index)"
            @changeSortOrder="changeSortOrder($event, index)"
            @changeLimit="changeLimit($event, index)"
          ></ChartHandler>
        </div>
        <div class="flex-row">
          <TimeSeriesChart
            v-if="
              currentFilteredStat &&
              currentFilteredStat.values.length > 0 &&
              initialized &&
              tsIsOpen
            "
            :stat="currentFilteredStat"
            :uniqueGrades="uniqueGrades"
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
              :currentFilters="currentFilters"
              :stats="stats"
              :startExpanded="false"
              @clearFilters="clearFilters"
            />
          </div>
          <ClimberColumnSelect
            :columns="columns"
            :labelMap="headings"
            @toggleActive="columns[$event.index]!.active = !columns[$event.index]!.active"
          >
          </ClimberColumnSelect>
        </div>

        <ClimberAscentTable
          :columns="activeColumns"
          :values="currentFilteredStat.values as unknown as ProcessedAscent[]"
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
