import { mapGrade, decomposeDate } from './Utils'
import type { ProcessedAscent } from './Utils'

// Send Cookies scoring: a send earns "cookies" based on how it compares to
// the climber's own level at the time, not absolute grade - see the plan
// doc/PR description for the full rationale. All constants below are the
// tunable knobs for the whole feature.
export const COOKIE_TOP_K = 5
export const COOKIE_DECAY_PER_YEAR = 1.0
export const COOKIE_BASE_MULTIPLIER = 5
export const COOKIE_HALF_LIFE_DAYS = 30
export const COOKIE_MAX_PER_SEND = 100

const MS_PER_DAY = 1000 * 60 * 60 * 24
const DAYS_PER_YEAR = 365.25

export interface CookieSend {
  ascent: ProcessedAscent
  levelAtTime: number
  cookiesEarned: number
  climber: string
  date: string
}

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

// A climber's "level" as of a date = the average of their top-K ascents'
// grades, each decayed linearly from its own date. Since every entry decays
// at the same constant rate, the *relative order* between any two entries'
// decayed values never changes over time (the common "-rate * asOf" term
// cancels out when comparing two entries) - so whichever entries rank in the
// top K when decayed to "today" are guaranteed to still be the true top K
// when later re-decayed to some future date. That's what makes the
// window-of-raw-(grade,date)-pairs approach below correct: we don't need to
// track every ascent forever, just the current top K, re-decaying them fresh
// against whatever date they're being evaluated against.
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

// Single chronological pass over one climber's ascents: for each send,
// scores it against the climber's level *at that time* (computed from only
// their strictly-earlier ascents), then folds it into the running top-K
// window. Never mutates the caller's array.
export function computeClimberCookieHistory(ascents: ProcessedAscent[]): CookieSend[] {
  const sorted = [...ascents].sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
  const window: GradeWindowEntry[] = []
  const sends: CookieSend[] = []
  for (const ascent of sorted) {
    const grade = mapGrade(ascent.grade, 0) as number
    const levelAtTime = levelFromWindow(window, ascent.date)
    const diff = grade - levelAtTime
    const cookiesEarned = Math.min(
      COOKIE_MAX_PER_SEND,
      Math.max(0, Math.floor(COOKIE_BASE_MULTIPLIER * Math.pow(2, diff))),
    )
    sends.push({ ascent, levelAtTime, cookiesEarned, climber: ascent.climber, date: ascent.date })
    updateWindow(window, { grade, date: ascent.date }, ascent.date)
  }
  return sends
}

// A send's cookie value decays with a fixed half-life from its own date -
// used both for the live leaderboard total and any future per-send display.
export function remainingCookies(send: CookieSend, asOf: Date): number {
  const sendDate = new Date(send.date + 'T12:00:00Z').getTime()
  const daysSince = (asOf.getTime() - sendDate) / MS_PER_DAY
  return send.cookiesEarned * Math.pow(0.5, Math.max(0, daysSince) / COOKIE_HALF_LIFE_DAYS)
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
    entry.total += remainingCookies(send, asOf)
    entry.sendCount += 1
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

// Monthly winner is independent of the decaying leaderboard total: whoever
// earned the most fresh (undecayed) cookie points from sends dated in that
// calendar month - a fixed historical record.
export function computeMonthlyWinners(allSends: CookieSend[]): MonthlyWinner[] {
  const byMonth = new Map<string, Map<string, number>>()
  for (const send of allSends) {
    const { year, month } = decomposeDate(send.date)
    const yearMonth = `${year}-${month}`
    let climberPoints = byMonth.get(yearMonth)
    if (!climberPoints) {
      climberPoints = new Map()
      byMonth.set(yearMonth, climberPoints)
    }
    climberPoints.set(send.climber, (climberPoints.get(send.climber) ?? 0) + send.cookiesEarned)
  }
  const winners: MonthlyWinner[] = []
  for (const [yearMonth, climberPoints] of byMonth) {
    let winner: MonthlyWinner | undefined
    for (const [climber, points] of climberPoints) {
      if (!winner || points > winner.points) {
        winner = { yearMonth, climber, points }
      }
    }
    if (winner) winners.push(winner)
  }
  winners.sort((a, b) => (a.yearMonth > b.yearMonth ? 1 : a.yearMonth < b.yearMonth ? -1 : 0))
  return winners
}

export function climberSendHistory(allSends: CookieSend[], climber: string): CookieSend[] {
  return allSends
    .filter((send) => send.climber === climber)
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
}

// Every 'YYYY-MM' month between the earliest and latest winner, inclusive -
// lets the calendar render a placeholder tile for months with zero sends
// instead of skipping them or leaving a gap.
export function monthRange(winners: MonthlyWinner[]): string[] {
  if (winners.length === 0) return []
  const sortedMonths = winners.map((w) => w.yearMonth).sort()
  const first = sortedMonths[0]!
  const last = sortedMonths[sortedMonths.length - 1]!
  const [startYear, startMonth] = first.split('-').map(Number) as [number, number]
  const [endYear, endMonth] = last.split('-').map(Number) as [number, number]
  const months: string[] = []
  let year = startYear
  let month = startMonth
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return months
}
