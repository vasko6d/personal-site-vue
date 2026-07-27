import { defineStore } from 'pinia'
import { ref, reactive, computed, shallowRef } from 'vue'
import Stat from '@/utils/Stat'
import { fetchData, preprocessAscent } from '@/utils/Utils'
import type { ProcessedAscent } from '@/utils/Utils'
import Timer from '@/utils/webgl/Timer'
import { importedClimbers } from '@/data/importedClimbers'
import { buildStatTree, DEFAULT_COLUMNS, DEFAULT_HEADINGS } from '@/stores/climbingShared'
import type { ColumnDef, StatFilterMap } from '@/components/climbing/types'

// Backs SandboxTicklist.vue - all climbers' ascents combined into one Stat
// tree (18,500+ ascents across 21 scorecards, the worst-case data volume for
// this feature). Same shape as useClimberAnalysisStore minus the dynamic-
// chart config (the ticklist page doesn't have charts), plus its own
// fetchAll() action and a `climber` filter key.
export const useClimberTicklistStore = defineStore('climberTicklist', () => {
  const loading = ref(true)
  const loadingMessage = ref('Fetching Scorecards...')
  const stats = shallowRef<Stat>(new Stat('ascents', []))

  const currentFilters: StatFilterMap = reactive({
    climber: { val: null, show: true },
    area: { val: null, show: true },
    year: { val: null, show: true },
    month: { val: null, show: true },
    dayOfWeek: { val: null, show: false },
    recommend: { val: null, show: false },
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

  const activeColumns = computed(() => columns.filter((col) => col.active).map((col) => col.name))
  const currentFilteredStat = computed(() => stats.value.getFiltered(undefined, currentFilters))

  function fetchAll() {
    // A Pinia store is a singleton, unlike the local component state this
    // store replaced (which was recreated fresh on every mount, and
    // App.vue's <router-view :key="$route.path"> remounts on every
    // navigation) - reset per-visit UI state so revisiting this page doesn't
    // leak the previous visit's filters/columns into the new fetch.
    clearFilters()
    columns.splice(0, columns.length, ...DEFAULT_COLUMNS.map((c) => ({ ...c })))

    loading.value = true
    loadingMessage.value = 'Fetching Scorecards...'
    setTimeout(() => {
      const promises: Promise<ProcessedAscent[]>[] = []
      const timer = new Timer(true)
      let fetchCount = 0
      importedClimbers.forEach((climber) => {
        promises.push(
          fetchData(climber.sandboxId).then((result) => {
            const ascents = (result as { ascents: Record<string, unknown>[] }).ascents.map(
              (ascent) => preprocessAscent(ascent as never, climber.name),
            )
            fetchCount++
            loadingMessage.value = `Fetching Scorecards ( ${fetchCount} / ${importedClimbers.length} )...`
            return Promise.resolve(ascents)
          }),
        )
      })
      Promise.all(promises).then((allAscents) => {
        loadingMessage.value = 'Processing Scorecards...'
        setTimeout(() => {
          const allAscentsFlat = ([] as ProcessedAscent[]).concat(...allAscents)
          stats.value = buildStatTree(allAscentsFlat)
          console.log(`[${timer.getTimeSec()}] All Ascents porcessed`)
          console.log('Ticklist: ', stats.value)
          loading.value = false
        }, 100)
      })
    }, 250)
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

  return {
    loading,
    loadingMessage,
    stats,
    currentFilters,
    columns,
    headings,
    activeColumns,
    currentFilteredStat,
    fetchAll,
    clearFilters,
  }
})
