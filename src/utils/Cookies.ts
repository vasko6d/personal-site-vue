import { mapGrade, decomposeDate } from './Utils'
import type { ProcessedAscent } from './Utils'

// Send Cookies scoring: a send earns "cookies" based on how it compares to
// the climber's own level at the time, not absolute grade - see the plan
// doc/PR description for the full rationale. All constants below are the
// tunable knobs for the whole feature.
export const COOKIE_TOP_K = 5
export const COOKIE_DECAY_PER_YEAR = 1.0
export const COOKIE_BASE_MULTIPLIER = 5
export const COOKIE_ACTIVE_MONTHS = 1
export const COOKIE_MAX_PER_SEND = 100
export const LEVEL_STEP_MONTHS = 12

const MS_PER_DAY = 1000 * 60 * 60 * 24
const DAYS_PER_YEAR = 365.25

export interface CookieSend {
  ascent: ProcessedAscent
  levelAtTime: number
  cookiesEarned: number
  climber: string
  date: string
}

// A send stays fully active for COOKIE_ACTIVE_MONTHS calendar months from its
// own date, then drops to exactly 0 - a hard cliff rather than smooth decay,
// so the running total lines up with "did this contribute to a monthly
// prize" cleanly. Note: calendar-month arithmetic via Date#setMonth means a
// send on e.g. Jan 31 expires "Mar 3" (Feb is short) rather than Feb 28/29 -
// an accepted quirk of using real calendar months, not a bug.
function addCalendarMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  result.setMonth(result.getMonth() + months)
  return result
}

// Whole calendar months elapsed between two 'YYYY-MM-DD' dates (both parsed
// at noon UTC, matching the rest of this file's date-string convention) -
// used by the level step-down below. Local getMonth/getDate accessors match
// addCalendarMonths' own local-time convention, so the two stay consistent.
function monthsBetween(fromDate: string, toDate: string): number {
  const from = new Date(fromDate + 'T12:00:00Z')
  const to = new Date(toDate + 'T12:00:00Z')
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months -= 1
  return months
}

// A climber's level is their hardest send, held constant, then dropping by
// exactly one grade every LEVEL_STEP_MONTHS calendar months they go without
// matching or beating it (a "hardest club" you get relegated from one rung
// at a time) - `sinceDate` is when the current `level` was last set/renewed.
// Applies however many full step-periods have elapsed by `toDate`, floored
// at 0, and advances `sinceDate` by exactly that many periods (not simply to
// `toDate`) so a later, larger gap correctly cascades further drops from
// where this one left off rather than restarting the clock early.
function stepDownLevel(
  level: number,
  sinceDate: string,
  toDate: string,
): { level: number; sinceDate: string } {
  if (level <= 0) return { level, sinceDate }
  const periods = Math.floor(monthsBetween(sinceDate, toDate) / LEVEL_STEP_MONTHS)
  if (periods <= 0) return { level, sinceDate }
  const newLevel = Math.max(0, level - periods)
  const appliedPeriods = level - newLevel
  const newSinceDate = addCalendarMonths(
    new Date(sinceDate + 'T12:00:00Z'),
    appliedPeriods * LEVEL_STEP_MONTHS,
  )
    .toISOString()
    .slice(0, 10)
  return { level: newLevel, sinceDate: newSinceDate }
}

export interface ClimberCookieHistory {
  sends: CookieSend[]
  currentLevel: number
}

// Single chronological pass over one climber's ascents, processed in
// same-date batches rather than one ascent at a time: for each date, steps
// the running "hardest club" level down to that date once (using only prior
// history - never mutates with hindsight), scores every ascent from that
// date against that same pre-batch level, then renews once using the
// batch's max grade (if it qualifies). This matters because there's no
// time-of-day data - if a climber sends several grades on the same day, we
// can't know the true order, so we have to assume the hardest one happened
// last (otherwise an easier same-day send could get scored against a level
// that only exists because of a harder send that day, undercutting it).
// Also returns the climber's current level as of asOfDate. Never mutates
// the caller's array.
export function computeClimberCookieHistory(
  ascents: ProcessedAscent[],
  asOfDate: Date = new Date(),
): ClimberCookieHistory {
  const sorted = [...ascents].sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
  const sends: CookieSend[] = []
  let level = 0
  let sinceDate: string | null = null
  let i = 0
  while (i < sorted.length) {
    const date = sorted[i]!.date
    let j = i
    while (j < sorted.length && sorted[j]!.date === date) j++
    if (sinceDate !== null) {
      ;({ level, sinceDate } = stepDownLevel(level, sinceDate, date))
    }
    const levelAtTime = level
    let maxGradeInBatch = -Infinity
    for (let k = i; k < j; k++) {
      const ascent = sorted[k]!
      const grade = mapGrade(ascent.grade, 0) as number
      maxGradeInBatch = Math.max(maxGradeInBatch, grade)
      const diff = grade - levelAtTime
      const cookiesEarned = Math.min(
        COOKIE_MAX_PER_SEND,
        Math.max(0, Math.floor(COOKIE_BASE_MULTIPLIER * Math.pow(2, diff))),
      )
      sends.push({ ascent, levelAtTime, cookiesEarned, climber: ascent.climber, date: ascent.date })
    }
    // Grades can be fractional (half-grades like '7/8' -> 7.5) but the level
    // must always be a whole number - flooring here (not at the diff/cookie
    // calc above, which still uses each send's precise raw grade) is what
    // keeps levelAtTime/currentLevel integral even when a half-grade send
    // renews.
    if (maxGradeInBatch >= level) {
      level = Math.floor(maxGradeInBatch)
      sinceDate = date
    }
    i = j
  }
  let currentLevel = level
  if (sinceDate !== null) {
    currentLevel = stepDownLevel(level, sinceDate, asOfDate.toISOString().slice(0, 10)).level
  }
  return { sends, currentLevel }
}

// Single source of truth for "is this send still contributing" - shared by
// remainingCookies, computeLeaderboard's total/sendCount, and the
// time-series sweep below. Active up to (not including) the exact
// one-month anniversary.
export function isSendActive(send: CookieSend, asOf: Date): boolean {
  return asOf.getTime() < addCalendarMonths(new Date(send.date + 'T12:00:00Z'), COOKIE_ACTIVE_MONTHS).getTime()
}

export function remainingCookies(send: CookieSend, asOf: Date): number {
  return isSendActive(send, asOf) ? send.cookiesEarned : 0
}

export interface LeaderboardEntry {
  climber: string
  total: number
  sendCount: number
}

export function computeLeaderboard(
  allSends: CookieSend[],
  asOf: Date = new Date(),
): LeaderboardEntry[] {
  const totals = new Map<string, LeaderboardEntry>()
  for (const send of allSends) {
    let entry = totals.get(send.climber)
    if (!entry) {
      entry = { climber: send.climber, total: 0, sendCount: 0 }
      totals.set(send.climber, entry)
    }
    if (isSendActive(send, asOf)) {
      entry.total += send.cookiesEarned
      entry.sendCount += 1
    }
  }
  return [...totals.values()].sort((a, b) => b.total - a.total)
}

export function currentHolder(leaderboard: LeaderboardEntry[]): LeaderboardEntry | undefined {
  return leaderboard[0]
}

export interface MonthlyWinner {
  yearMonth: string
  climber: string
  points: number
}

interface MonthTally {
  points: number
  count: number
}

// Shared per-(month,climber) tally backing both computeMonthlyWinners and
// computeMonthlyLeaderboard, so the two can never disagree on who "won" a
// given month.
function tallyByMonthAndClimber(allSends: CookieSend[]): Map<string, Map<string, MonthTally>> {
  const byMonth = new Map<string, Map<string, MonthTally>>()
  for (const send of allSends) {
    const { year, month } = decomposeDate(send.date)
    const yearMonth = `${year}-${month}`
    let climberTallies = byMonth.get(yearMonth)
    if (!climberTallies) {
      climberTallies = new Map()
      byMonth.set(yearMonth, climberTallies)
    }
    const tally = climberTallies.get(send.climber) ?? { points: 0, count: 0 }
    tally.points += send.cookiesEarned
    tally.count += 1
    climberTallies.set(send.climber, tally)
  }
  return byMonth
}

// Monthly winner is independent of the decaying leaderboard total: whoever
// earned the most fresh (undecayed) cookie points from sends dated in that
// calendar month - a fixed historical record.
export function computeMonthlyWinners(allSends: CookieSend[]): MonthlyWinner[] {
  const byMonth = tallyByMonthAndClimber(allSends)
  const winners: MonthlyWinner[] = []
  for (const [yearMonth, climberTallies] of byMonth) {
    let winner: MonthlyWinner | undefined
    for (const [climber, tally] of climberTallies) {
      if (!winner || tally.points > winner.points) {
        winner = { yearMonth, climber, points: tally.points }
      }
    }
    if (winner) winners.push(winner)
  }
  winners.sort((a, b) => (a.yearMonth > b.yearMonth ? 1 : a.yearMonth < b.yearMonth ? -1 : 0))
  return winners
}

// Full per-climber ranking for one calendar month (undecayed cookie points
// earned that month). The [0] entry is always the same climber
// computeMonthlyWinners would report for that month, since both read from
// the same tally.
export function computeMonthlyLeaderboard(
  allSends: CookieSend[],
  yearMonth: string,
): LeaderboardEntry[] {
  const climberTallies = tallyByMonthAndClimber(allSends).get(yearMonth)
  if (!climberTallies) return []
  return [...climberTallies.entries()]
    .map(([climber, tally]) => ({ climber, total: tally.points, sendCount: tally.count }))
    .sort((a, b) => b.total - a.total)
}

export function climberSendHistory(allSends: CookieSend[], climber: string): CookieSend[] {
  return allSends
    .filter((send) => send.climber === climber)
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
}

export interface CookieTimeSeriesEntry {
  climber: string
  points: { x: Date; y: number }[]
}

// Exact (not sampled) cookie-count-over-time series per climber, built via a
// sweep-line over each send's active window: +cookiesEarned at its own date,
// -cookiesEarned at its expiry. Since decay is now a hard cliff (not smooth),
// this produces an exact piecewise-constant series with one point per event
// - pairs with Chart.js's `stepped: 'after'` line rendering.
export function computeCookieTimeSeries(
  allSends: CookieSend[],
  climbers: string[],
  asOf: Date,
  months = 12,
): CookieTimeSeriesEntry[] {
  const windowStart = addCalendarMonths(asOf, -months)
  return climbers.map((climber) => {
    const sends = allSends.filter((send) => send.climber === climber)
    let seed = 0
    const events: { date: Date; delta: number }[] = []
    for (const send of sends) {
      const sendDate = new Date(send.date + 'T12:00:00Z')
      const expiry = addCalendarMonths(sendDate, COOKIE_ACTIVE_MONTHS)
      if (sendDate <= windowStart && expiry > windowStart) {
        seed += send.cookiesEarned
      }
      if (sendDate > windowStart && sendDate <= asOf) {
        events.push({ date: sendDate, delta: send.cookiesEarned })
      }
      if (expiry > windowStart && expiry <= asOf) {
        events.push({ date: expiry, delta: -send.cookiesEarned })
      }
    }
    events.sort((a, b) => a.date.getTime() - b.date.getTime())
    const points: { x: Date; y: number }[] = [{ x: windowStart, y: seed }]
    let total = seed
    for (const event of events) {
      total += event.delta
      const last = points[points.length - 1]!
      if (last.x.getTime() === event.date.getTime()) {
        last.y = total
      } else {
        points.push({ x: event.date, y: total })
      }
    }
    points.push({ x: asOf, y: total })
    return { climber, points }
  })
}

// Cumulative (undecayed) cookie count across a single calendar month, for
// the month-filtered view - no expiry/cliff logic needed at all here, since
// a send dated within a given month can never hit its one-month expiry
// before that same month ends.
export function computeMonthlyCookieTimeSeries(
  allSends: CookieSend[],
  climbers: string[],
  yearMonth: string,
): CookieTimeSeriesEntry[] {
  const monthStart = new Date(`${yearMonth}-01T12:00:00Z`)
  const monthEnd = addCalendarMonths(monthStart, 1)
  return climbers.map((climber) => {
    const sends = allSends
      .filter((send) => send.climber === climber && send.date.startsWith(yearMonth))
      .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
    const points: { x: Date; y: number }[] = [{ x: monthStart, y: 0 }]
    let total = 0
    for (const send of sends) {
      total += send.cookiesEarned
      const x = new Date(send.date + 'T12:00:00Z')
      const last = points[points.length - 1]!
      if (last.x.getTime() === x.getTime()) {
        last.y = total
      } else {
        points.push({ x, y: total })
      }
    }
    points.push({ x: monthEnd, y: total })
    return { climber, points }
  })
}

// --- Legacy decayed-average level model -------------------------------
// Superseded by the step-function "hardest club" model above for Send
// Cookies scoring, but kept as a reusable building block for the Analysis
// page's "Boulderer Score" stat and time-series line (see
// useClimberAnalysisStore.ts / TimeSeriesChart.vue).

interface GradeWindowEntry {
  grade: number
  date: string
}

function yearsBetween(fromDate: string, toDate: string): number {
  const from = new Date(fromDate + 'T12:00:00Z').getTime()
  const to = new Date(toDate + 'T12:00:00Z').getTime()
  return (to - from) / (MS_PER_DAY * DAYS_PER_YEAR)
}

function decayedValue(entry: GradeWindowEntry, asOfDate: string): number {
  return entry.grade - COOKIE_DECAY_PER_YEAR * yearsBetween(entry.date, asOfDate)
}

// The average of the top-K ascents' grades, each decayed linearly from its
// own date. Since every entry decays at the same constant rate, the
// *relative order* between any two entries' decayed values never changes
// over time (the common "-rate * asOf" term cancels out when comparing two
// entries) - so whichever entries rank in the top K when decayed to "today"
// are guaranteed to still be the true top K when later re-decayed to some
// future date. That's what makes the window-of-raw-(grade,date)-pairs
// approach below correct: we don't need to track every ascent forever, just
// the current top K, re-decaying them fresh against whatever date they're
// being evaluated against. Deliberately unrounded - callers decide whether
// to floor it or display it as-is.
function levelFromWindow(window: GradeWindowEntry[], asOfDate: string): number {
  if (window.length === 0) return 0
  const sum = window.reduce((total, entry) => total + decayedValue(entry, asOfDate), 0)
  return sum / window.length
}

// Keeps `window` as the top-COOKIE_TOP_K entries by decayed value evaluated
// as of `referenceDate` (in practice always the incoming ascent's own date -
// see the comment on levelFromWindow for why any reference date gives the
// same ranking). Mutates `window` in place, mirroring the "keep highest K"
// shape of updateTop() in Utils.ts, but keeping the (grade, date) pair
// instead of a bare number since re-decaying later needs the original date.
function updateWindow(window: GradeWindowEntry[], entry: GradeWindowEntry, referenceDate: string) {
  const rank = (e: GradeWindowEntry) => decayedValue(e, referenceDate)
  if (window.length < COOKIE_TOP_K) {
    window.push(entry)
  } else if (rank(window[window.length - 1]!) < rank(entry)) {
    window.pop()
    window.push(entry)
  } else {
    return
  }
  window.sort((a, b) => rank(b) - rank(a))
}

export function computeDecayedAverageLevel(
  ascents: ProcessedAscent[],
  asOfDate: Date = new Date(),
): number {
  const sorted = [...ascents].sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
  const window: GradeWindowEntry[] = []
  for (const ascent of sorted) {
    const grade = mapGrade(ascent.grade, 0) as number
    updateWindow(window, { grade, date: ascent.date }, ascent.date)
  }
  return levelFromWindow(window, asOfDate.toISOString().slice(0, 10))
}

// One point per distinct ascent date, valued *after* incorporating that
// day's send(s) - unlike the Send Cookies scoring pass, this is a
// display-only trend line (not scoring anything), so there's no hindsight
// concern in using same-day information. Same-day sends collapse to the
// last value, matching how generateTimeSeries's day rollup already treats
// same-day ascents as one point.
export function computeDecayedAverageLevelHistory(
  ascents: ProcessedAscent[],
): { x: Date; y: number }[] {
  const sorted = [...ascents].sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
  const window: GradeWindowEntry[] = []
  const points: { x: Date; y: number }[] = []
  for (const ascent of sorted) {
    const grade = mapGrade(ascent.grade, 0) as number
    updateWindow(window, { grade, date: ascent.date }, ascent.date)
    const level = levelFromWindow(window, ascent.date)
    const x = new Date(ascent.date + 'T12:00:00Z')
    const last = points[points.length - 1]
    if (last && last.x.getTime() === x.getTime()) {
      last.y = level
    } else {
      points.push({ x, y: level })
    }
  }
  return points
}
