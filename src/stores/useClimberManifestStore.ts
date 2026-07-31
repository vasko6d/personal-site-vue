import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchManifest } from '@/utils/Utils'
import type { ScorecardManifestEntry } from '@/utils/Utils'
import { HIDDEN_CLIMBER_SLUGS, CLIMBER_SORT_ORDER } from '@/data/climberDisplayConfig'

// Singleton source of "which climbers exist" - replaces the hand-maintained
// importedClimbers.ts. Fetched on-demand by whichever route mounts first
// (ClimberSelect.vue / useClimberTicklistStore / useSendCookiesStore all
// call fetchAll()); being a Pinia store this is naturally a shared cache, so
// only the first caller actually hits the network.
export const useClimberManifestStore = defineStore('climberManifest', () => {
  const loading = ref(true)
  const loadingMessage = ref('Fetching Climber List...')
  const error = ref<string | null>(null)
  const scorecards = ref<ScorecardManifestEntry[]>([])
  const loaded = ref(false)

  // All entries from the manifest, sorted by slug - stable and
  // hide-independent. Used anywhere a stable index or a direct slug lookup
  // is needed regardless of the hide config (avatar/series color
  // assignment, resolving a possibly-hidden climber's display name).
  const allClimbers = computed(() =>
    [...scorecards.value].sort((a, b) => a.userSlug.localeCompare(b.userSlug)),
  )

  // Visible climbers only (hidden slugs excluded) - feeds the Ticklist and
  // Send Cookies aggregates.
  const visibleClimbers = computed(() =>
    allClimbers.value.filter((c) => !HIDDEN_CLIMBER_SLUGS.has(c.userSlug)),
  )

  // visibleClimbers ordered per CLIMBER_SORT_ORDER, with anything not listed
  // appended afterward sorted alphabetically by userName. Feeds
  // ClimberSelect's dropdown.
  const sortedClimbers = computed(() => {
    const bySlug = new Map(visibleClimbers.value.map((c) => [c.userSlug, c]))
    const ordered: ScorecardManifestEntry[] = []
    for (const slug of CLIMBER_SORT_ORDER) {
      const entry = bySlug.get(slug)
      if (entry) {
        ordered.push(entry)
        bySlug.delete(slug)
      }
    }
    const remaining = [...bySlug.values()].sort((a, b) => a.userName.localeCompare(b.userName))
    return [...ordered, ...remaining]
  })

  function findBySlug(userSlug: string): ScorecardManifestEntry | undefined {
    return allClimbers.value.find((c) => c.userSlug === userSlug)
  }

  function fetchAll(): Promise<void> {
    if (loaded.value) return Promise.resolve() // singleton cache - no-op on repeat calls
    loading.value = true
    loadingMessage.value = 'Fetching Climber List...'
    error.value = null
    return fetchManifest()
      .then((manifest) => {
        scorecards.value = manifest.scorecards
        loaded.value = true
        loading.value = false
      })
      .catch((e) => {
        error.value = (e && e.msg) || 'Failed to load climber list'
        loading.value = false
      })
  }

  return {
    loading,
    loadingMessage,
    error,
    allClimbers,
    visibleClimbers,
    sortedClimbers,
    findBySlug,
    fetchAll,
  }
})
