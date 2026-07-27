import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { fetchData, preprocessAscent } from '@/utils/Utils'
import type { ProcessedAscent } from '@/utils/Utils'
import { importedClimbers } from '@/data/importedClimbers'
import {
  computeClimberCookieHistory,
  computeLeaderboard,
  currentHolder,
  computeMonthlyWinners,
  computeCookieTimeSeries,
  type CookieSend,
  type ClimberCurrentLevel,
  type ClimberCookieHistory,
} from '@/utils/Cookies'

// Backs SendCookies.vue - fetches every climber's scorecard (same fetch-all
// shape as useClimberTicklistStore.ts) and, instead of building a Stat tree,
// scores each climber's ascents into a flat CookieSend[] via
// computeClimberCookieHistory. allSends is a shallowRef because it holds one
// object per ascent across all 21 climbers (~18k) - see MIGRATION_NOTES.md
// for why a deep ref over an array this size is a perf trap.
export const useSendCookiesStore = defineStore('sendCookies', () => {
  const loading = ref(true)
  const loadingMessage = ref('Fetching Scorecards...')
  const allSends = shallowRef<CookieSend[]>([])
  const currentLevels = shallowRef<Map<string, ClimberCurrentLevel>>(new Map())
  const asOf = ref(new Date())

  const leaderboard = computed(() => computeLeaderboard(allSends.value, asOf.value))
  const holder = computed(() => currentHolder(leaderboard.value))
  const monthlyWinners = computed(() => computeMonthlyWinners(allSends.value))
  const topClimberNames = computed(() => leaderboard.value.slice(0, 10).map((e) => e.climber))
  const timeSeries = computed(() =>
    computeCookieTimeSeries(allSends.value, topClimberNames.value, asOf.value, 12),
  )

  function fetchAll() {
    // Snapshot "now" once, before any climber's history is scored, so a
    // climber's currentLevel and the leaderboard's active/expired boolean
    // (a hard cliff, not a smooth decay) are always evaluated against the
    // exact same instant - otherwise a send right on the boundary could read
    // as active in one place and expired in another.
    const snapshotAsOf = new Date()
    loading.value = true
    loadingMessage.value = 'Fetching Scorecards...'
    setTimeout(() => {
      const promises: Promise<ClimberCookieHistory>[] = []
      let fetchCount = 0
      importedClimbers.forEach((climber) => {
        promises.push(
          fetchData(climber.sandboxId).then((result) => {
            const ascents = (result as { ascents: Record<string, unknown>[] }).ascents.map(
              (ascent) => preprocessAscent(ascent as never, climber.name),
            )
            fetchCount++
            loadingMessage.value = `Fetching Scorecards ( ${fetchCount} / ${importedClimbers.length} )...`
            return computeClimberCookieHistory(ascents as unknown as ProcessedAscent[], snapshotAsOf)
          }),
        )
      })
      Promise.all(promises).then((perClimberResults) => {
        loadingMessage.value = 'Counting Cookies...'
        setTimeout(() => {
          allSends.value = ([] as CookieSend[]).concat(...perClimberResults.map((r) => r.sends))
          currentLevels.value = new Map(
            importedClimbers.map((climber, i) => [climber.name, perClimberResults[i]!.currentLevel]),
          )
          asOf.value = snapshotAsOf
          loading.value = false
        }, 100)
      })
    }, 250)
  }

  return {
    loading,
    loadingMessage,
    allSends,
    currentLevels,
    asOf,
    leaderboard,
    holder,
    monthlyWinners,
    topClimberNames,
    timeSeries,
    fetchAll,
  }
})
