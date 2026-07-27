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
  type CookieSend,
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
  const asOf = ref(new Date())

  const leaderboard = computed(() => computeLeaderboard(allSends.value, asOf.value))
  const holder = computed(() => currentHolder(leaderboard.value))
  const monthlyWinners = computed(() => computeMonthlyWinners(allSends.value))

  function fetchAll() {
    loading.value = true
    loadingMessage.value = 'Fetching Scorecards...'
    setTimeout(() => {
      const promises: Promise<CookieSend[]>[] = []
      let fetchCount = 0
      importedClimbers.forEach((climber) => {
        promises.push(
          fetchData(climber.sandboxId).then((result) => {
            const ascents = (result as { ascents: Record<string, unknown>[] }).ascents.map(
              (ascent) => preprocessAscent(ascent as never, climber.name),
            )
            fetchCount++
            loadingMessage.value = `Fetching Scorecards ( ${fetchCount} / ${importedClimbers.length} )...`
            return computeClimberCookieHistory(ascents as unknown as ProcessedAscent[])
          }),
        )
      })
      Promise.all(promises).then((perClimberSends) => {
        loadingMessage.value = 'Counting Cookies...'
        setTimeout(() => {
          allSends.value = ([] as CookieSend[]).concat(...perClimberSends)
          asOf.value = new Date()
          loading.value = false
        }, 100)
      })
    }, 250)
  }

  return {
    loading,
    loadingMessage,
    allSends,
    asOf,
    leaderboard,
    holder,
    monthlyWinners,
    fetchAll,
  }
})
