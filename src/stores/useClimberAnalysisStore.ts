import { defineStore } from 'pinia'
import { ref, reactive, computed, shallowRef } from 'vue'
import Stat from '@/utils/Stat'
import Aggregate from '@/utils/Aggregate'
import { preprocessAscent, mapGrade, vScale } from '@/utils/Utils'
import type { ProcessedAscent } from '@/utils/Utils'
import {
  buildStatTree,
  dateAnalysis,
  ascentAnalysis,
  DEFAULT_COLUMNS,
  DEFAULT_HEADINGS,
} from '@/stores/climbingShared'
import type { ClimberStat } from '@/stores/climbingShared'
import type {
  AggOpts,
  ColumnDef,
  DynamicChartConfig,
  StatFilterMap,
} from '@/components/climbing/types'

// Backs ClimberAnalysis.vue, which is shared by two parents -
// SandboxAnalysis.vue (fetched by sandboxId) and ClimbingImportAnalysis.vue
// (pasted/uploaded JSON) - both feed it the same climberName/rawAscents
// props, translated into buildFromAscents() below. Centralizes state that
// was previously local to ClimberAnalysis.vue (currentFilters/columns/
// charts.dynamic), and keeps the Stat tree out of Vue's reactivity via
// shallowRef (Stat instances also markRaw themselves - see Stat.ts).
export const useClimberAnalysisStore = defineStore('climberAnalysis', () => {
  const climberName = ref('')
  const ascents = ref<ProcessedAscent[]>([])
  const stats = shallowRef<Stat>(new Stat('ascents', []))
  const initialized = ref(false)

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

  const columns = reactive<ColumnDef[]>(DEFAULT_COLUMNS.map((c) => ({ ...c })))
  const headings = DEFAULT_HEADINGS

  const charts = reactive<{ dynamic: DynamicChartConfig[] }>({ dynamic: [] })

  const activeColumns = computed(() => columns.filter((col) => col.active).map((col) => col.name))
  const currentFilteredStat = computed(() => stats.value.getFiltered(undefined, currentFilters))

  const uniqueGrades = computed(() => {
    const uniqueGradeSet = new Set(
      (currentFilteredStat.value.values as unknown as ProcessedAscent[]).map(
        (el) => mapGrade(el.grade, 0) as number,
      ),
    )
    return Array.from(uniqueGradeSet)
  })

  const climberStatsSummary = computed<ClimberStat[]>(() => {
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

  function buildFromAscents(name: string, rawAscents: Record<string, unknown>[]) {
    // A Pinia store is a singleton, unlike the local component state this
    // store replaced (which was recreated fresh on every mount, and
    // App.vue's <router-view :key="$route.path"> remounts on every climber
    // navigation) - reset per-visit UI state here so switching climbers
    // doesn't leak the previous climber's filters/columns/charts/initialized
    // flag into the new one.
    clearFilters()
    columns.splice(0, columns.length, ...DEFAULT_COLUMNS.map((c) => ({ ...c })))
    charts.dynamic.splice(0, charts.dynamic.length)
    initialized.value = false

    climberName.value = name
    ascents.value = rawAscents.map((ascent) => preprocessAscent(ascent as never, name))
    stats.value = buildStatTree(ascents.value)
    console.log('Analytics: ', stats.value)
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
    // filters is a stable reference to this store's own reactive currentFilters -
    // read directly by getGradeChartData's type-based branches and by
    // ChartHandler.vue's showChart, not just used to narrow the stat.
    opts.filters = currentFilters
    charts.dynamic.push({ type: chartType, statBase: statBase, opts: opts })
  }

  function closeChart(chartIndex: number) {
    charts.dynamic[chartIndex]!.opts.hideChart = true
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

  return {
    climberName,
    ascents,
    stats,
    initialized,
    currentFilters,
    columns,
    headings,
    charts,
    activeColumns,
    currentFilteredStat,
    uniqueGrades,
    climberStatsSummary,
    buildFromAscents,
    clearFilters,
    addDynamicChart,
    closeChart,
    changeChartType,
    changeSortOrder,
    changeLimit,
    changeBaseStat,
    changeAggregator,
    changeSplitStat,
    changeSplitLimit,
  }
})
