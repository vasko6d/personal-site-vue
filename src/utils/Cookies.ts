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
//
// The returned average is deliberately unrounded - callers decide whether
// they need the raw value (e.g. for display) or the floored whole-number
// "official" level used for scoring (see computeClimberCookieHistory).
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

export interface ClimberCurrentLevel {
  raw: number
  rounded: number
}

export interface ClimberCookieHistory {
  sends: CookieSend[]
  currentLevel: ClimberCurrentLevel
}

// Single chronological pass over one climber's ascents: for each send,
// scores it against the climber's level *at that time* (computed from only
// their strictly-earlier ascents, floored to a whole number - the top-K
// window itself still ranks by continuous decayed values, only the consumed
// average gets floored), then folds it into the running top-K window. Also
// returns the climber's *current* level (as of asOfDate) in both raw and
// floored form, for display. Never mutates the caller's array.
export function computeClimberCookieHistory(
  ascents: ProcessedAscent[],
  asOfDate: Date = new Date(),
): ClimberCookieHistory {
  const sorted = [...ascents].sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
  const window: GradeWindowEntry[] = []
  const sends: CookieSend[] = []
  for (const ascent of sorted) {
    const grade = mapGrade(ascent.grade, 0) as number
    const levelAtTime = Math.floor(levelFromWindow(window, ascent.date))
    const diff = grade - levelAtTime
    const cookiesEarned = Math.min(
      COOKIE_MAX_PER_SEND,
      Math.max(0, Math.floor(COOKIE_BASE_MULTIPLIER * Math.pow(2, diff))),
    )
    sends.push({ ascent, levelAtTime, cookiesEarned, climber: ascent.climber, date: ascent.date })
    updateWindow(window, { grade, date: ascent.date }, ascent.date)
  }
  const raw = levelFromWindow(window, asOfDate.toISOString().slice(0, 10))
  return { sends, currentLevel: { raw, rounded: Math.floor(raw) } }
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

function expiryDate(send: CookieSend): Date {
  return addCalendarMonths(new Date(send.date + 'T12:00:00Z'), COOKIE_ACTIVE_MONTHS)
}

// Single source of truth for "is this send still contributing" - shared by
// remainingCookies, computeLeaderboard's total/sendCount, and the
// time-series sweep below. Active up to (not including) the exact
// one-month anniversary.
export function isSendActive(send: CookieSend, asOf: Date): boolean {
  return asOf.getTime() < expiryDate(send).getTime()
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
      const expiry = expiryDate(send)
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
