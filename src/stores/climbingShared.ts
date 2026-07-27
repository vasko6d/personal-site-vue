import type { ProcessedAscent } from '@/utils/Utils'

// Explicit allowlist of ProcessedAscent fields that are ever actually queried
// through the Stat tree - the union of every currentFilters key used across
// the climbing views (ClimberAnalysis.vue, SandboxTicklist.vue) and every
// category Aggregate.ts's `compatibility` map exposes (SettingView.vue's
// "Base Stat"/aggregator-category dropdowns reach a few fields outside
// currentFilters, e.g. `date`, `day`, `commentLength`, `name`).
//
// preprocessAscent spreads the raw 8a.nu payload before overriding known
// fields, so a ProcessedAscent actually carries ~30+ top-level keys (things
// like zlaggableSlug, cragSlug, userAvatar, isHard, secondGo, ...) that are
// never read anywhere - building a Stat subtree for each of those roughly
// doubles goDeeper()'s work for no benefit. Passing this allowlist (inverted
// to an ignore set) at tree-construction time cuts that out; see
// MIGRATION_NOTES.md for the full investigation.
export const STAT_CATEGORY_ALLOWLIST: ReadonlySet<string> = new Set([
  // currentFilters keys (union of the analytics + ticklist views)
  'area',
  'subArea',
  'year',
  'month',
  'dayOfWeek',
  'recommend',
  'grade',
  'rating',
  'softness',
  'flags',
  'type',
  'country',
  'climber',
  // reachable outside currentFilters via Aggregate.ts's compatibility map
  // (SettingView.vue's aggregator-category dropdown)
  'day',
  'date',
  'commentLength',
  'name',
  'state',
])

export function computeIgnoreSet(sample: ProcessedAscent): Set<string> {
  return new Set(Object.keys(sample).filter((key) => !STAT_CATEGORY_ALLOWLIST.has(key)))
}
