import Stat from '@/utils/Stat'
import { mapGrade } from '@/utils/Utils'
import type { ProcessedAscent } from '@/utils/Utils'
import type { ColumnDef } from '@/components/climbing/types'

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

// Shared between ClimberAnalysis.vue (single climber) and SandboxTicklist.vue
// (all climbers) - both views started with an identical copy-pasted copy of
// these, kept here as the single source of truth instead.
export const DEFAULT_COLUMNS: ColumnDef[] = [
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
]

export const DEFAULT_HEADINGS: Record<string, string> = {
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

// Builds a Stat tree from a batch of already-preprocessed ascents, with the
// ignore set computed from an allowlist rather than the original bare
// ['comment'] list (see STAT_CATEGORY_ALLOWLIST above). This is the one
// place a Stat tree gets constructed for the climbing feature - both stores
// call it, keeping the ignore-set logic in exactly one place.
export function buildStatTree(ascents: ProcessedAscent[]): Stat {
  const ignore = ascents.length > 0 ? computeIgnoreSet(ascents[0]!) : []
  const stat = new Stat('ascents', ignore)
  stat.goDeeper(ascents as unknown as Record<string, unknown>[])
  return stat
}

export interface DoubleEntry {
  date: string
  ascents: ProcessedAscent[]
}

export interface ClimberStat {
  name: string
  value: string | number | undefined
  dates?: DoubleEntry[]
}

// Ported verbatim from ClimberAnalysis.vue's former local dateAnalysis().
export function dateAnalysis(stat: Stat) {
  const dates = Object.keys(stat.get('date').subStats)
  dates.sort()
  return {
    firstDate: dates[0],
    mostRecent: dates[dates.length - 1],
    count: dates.length,
  }
}

// Ported verbatim from ClimberAnalysis.vue's former local ascentAnalysis().
export function ascentAnalysis(stat: Stat, ntop = 10) {
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
