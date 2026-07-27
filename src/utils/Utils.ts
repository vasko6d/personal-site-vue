import Stat, { type StatKey } from './Stat'

const gradeMap: Record<string, number> = {
  B: -1,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  '3/4': 3.5,
  4: 4,
  '4/5': 4.5,
  5: 5,
  '5/6': 5.5,
  6: 6,
  7: 7,
  '7/8': 7.5,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
}

const typeMap: Record<string, string> = {
  rp: 'redpoint',
  os: 'onsite',
  f: 'flash',
}

const fontToV: Record<string, string> = {
  '5A': '0',
  '5B': '1',
  '5C': '2',
  '6A': '3',
  '6A+': '3/4',
  '6B': '4',
  '6B+': '4/5',
  '6C': '5',
  '6C+': '5/6',
  '7A': '6',
  '7A+': '7',
  '7B': '7/8',
  '7B+': '8',
  '7C': '9',
  '7C+': '10',
  '8A': '11',
  '8A+': '12',
  '8B': '13',
  '8B+': '14',
  '8C': '15',
  '8C+': '16',
  '9A': '17',
}

const nameMaps: Record<string, Record<string, string>> = {
  month: {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  },
  rating: {
    0: '0 Stars',
    1: '1 Star',
    2: '2 Stars',
    3: '3 Stars',
    4: '4 Stars',
    5: '5 Stars',
  },
  dayOfWeek: {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  },
  recommend: {
    true: 'Recommended',
    false: 'Not Recommended',
  },
}

// Area Name Map (new)
const areaNameFixes: Record<string, string> = {
  'Red Rock': 'Red Rocks',
  'Joes Valley': "Joe's Valley",
  Tuolumne: 'Tuolumne Meadows',
}

// Distinct Colors
const distinctColors = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#fabebe',
  '#008080',
  '#e6beff',
  '#9a6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#808080',
  '#000000',
]

// TODO: in the filterable shoudl create a nested view ex US -> California -> Bishop -> Catacombs / Main / Rock Creek
interface SpecialAreaCase {
  name: string
  uniqueSubAreas: string[]
  uniqueSectorSlugs?: Record<string, string[]>
}

const specialAreaCases: Record<string, SpecialAreaCase> = {
  arizona: {
    name: 'Arizona',
    uniqueSubAreas: ['kelly-canyon'],
  },
  'bishop-ca': {
    name: 'Bishop',
    uniqueSubAreas: ['rock-creek', 'catacombs', 'heaven'],
  },
  california: {
    name: 'California',
    uniqueSubAreas: ['salt-point', 'stinson-beach'],
  },
  colorado: {
    name: 'Colorado',
    uniqueSubAreas: ['mt-evans', 'newlin'],
    uniqueSectorSlugs: {
      // Could maybe swtich "Destination" to Mt Evans in cases like this so we have more granularity
      'mt-evans': ['lincoln-lake'],
    },
  },
  'yosemite-ca': {
    name: 'Yosemite',
    uniqueSubAreas: ['tuolumne-meadows'],
  },
  washington: {
    name: 'Washington',
    // TODO: Need a map miller river obviously has a generated suffix
    uniqueSubAreas: ['leavenworth-boulders', 'miller-river-vjvzn', 'index', 'gold-bar'],
  },
}

export interface RawAscent {
  area: string
  areaSlug: string
  areaName?: string
  cragName: string
  cragSlug: string
  sectorSlug: string
  zlaggableName: string
  zlaggableSlug: string
  countrySlug: string
  date: string
  difficulty: string
  comment: string | null
  firstAscent: boolean
  isHard: boolean
  isSoft: boolean
  isEasy?: boolean
  isOverhang?: boolean
  isVertical?: boolean
  isSlab?: boolean
  isRoof?: boolean
  isAthletic?: boolean
  isEndurance?: boolean
  isCrimpy?: boolean
  isCruxy?: boolean
  isSloper?: boolean
  isTechnical?: boolean
  isDanger?: boolean
  withKneepad?: boolean
  rating: number
  recommended?: boolean
  secondGo: boolean
  type: string
  [key: string]: unknown
}

export interface ProcessedAscent {
  area: string
  destination: string | null
  climber: string
  comment: string | null
  commentLength: number
  countrySlug: string
  cragSlug: string
  name: string
  country: string
  date: string
  day: string
  dayOfWeek: number
  firstAscent: boolean
  flags: string[]
  grade: string
  isHard: boolean
  isSoft: boolean
  month: string
  rating: number
  recommend: boolean
  secondGo: boolean
  sectorSlug: string
  softness: 'Soft' | 'Hard' | 'Neutral'
  subArea: string
  type: string
  year: string
  zlaggableSlug: string
  [key: string]: unknown
}

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF'.split('')
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function getDistinctColor(index: number): string {
  if (index < distinctColors.length) return distinctColors[index]!
  return getRandomColor()
}

export function formatString(format: string, ...args: unknown[]): string {
  return format.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] != 'undefined' ? String(args[number]) : match
  })
}

export function mapName(
  statName: string,
  nameToMap: StatKey,
  nameMap: Record<string, string> | false = false,
): string | undefined {
  if (nameMap) {
    return nameMap[String(nameToMap)]
  } else if (nameMaps[statName]) {
    return nameMaps[statName][String(nameToMap)]
  }
  return String(nameToMap)
}

export function mapGrade(grade: StatKey, minVal = -10, sys = 'V'): number | undefined {
  // V or font will eventually be supported
  if (sys === 'V') {
    return Math.max(gradeMap[String(grade)] as number, minVal)
  }
  return undefined
}

export function makeInt(catagory: string, value: StatKey): number {
  return catagory === 'grade' ? (mapGrade(value, 0) as number) : parseInt(String(value))
}

export function vScale(grade: StatKey): string {
  return 'V' + grade
}

export function kebabToCap(str: string): string {
  return str
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.substr(1))
    .join(' ')
}

/*
Process the RAW JSON from 81.nu into dv format:

  RAW: {
    "ascentId": 6012919,
    "areaName": "Bishop (CA)",
    "areaSlug": "bishop-ca",
    "cragName": "Sad Boulders",
    "cragSlug": "sad-boulders",
    "sectorSlug": "unknown-sector-79fad",
    "zlaggableName": "The Ninth Wave",
    "zlaggableSlug": "the-ninth-wave",
    "countrySlug": "united-states",
    "userAvatar": "gallery/44437.jpg",
    "userName": "Gregor recian-God",
    "userSlug": "david-vasko",
    "date": "2020-12-11T12:00:00+00:00",
    "difficulty": "7B+",
    "gradeIndex": 26,
    "comment": "Lubba dubba dub dub!!! I did it boys! I did the thing! Not the thing over there, but this thing!",
    "isPrivateComment": false,
    "traditional": false,
    "project": false,
    "isHard": false,
    "isSoft": false,
    "firstAscent": false,
    "secondGo": false,
    "type": "rp",
    "notes": "Lubba dubba dub dub!!! I did it boys! I did the thing! Not the thing over there, but this thing!",
    "rating": 4
  }

  PROCESSED: {
    "area": "Bishop",
    "climber": "David Vasko",
    "comment": "Lubba dubba dub dub!!! I did it boys! I did the thing! Not the thing over there, but this thing!",
    "commentLength": 96,
    "date": "2020-12-11",
    "day": "11",
    "dayOfWeek": 5,
    "name": "The Ninth Wave",
    "firstAscent": false,
    "flags": [
      "redpoint"
    ],
    "grade": "8",
    "isHard": false,
    "isSoft": false,
    "month": "12",
    "rating": 4,
    "type": "redpoint",
    "secondGo": false,
    "softness": "Neutral",
    "subArea": "Sad Boulders"
    "year": "2020",
  }
*/
export function preprocessAscent(ascent: RawAscent, climber: string): ProcessedAscent {
  const processedAscent: Record<string, unknown> = {
    ...ascent, // Copy all ascent properties
    area: ascent.area,
    destination: null, // IF a larger area is given ex Bishop
    climber: climber,
    comment: ascent.comment,
    commentLength: ascent.comment ? ascent.comment.length : 0,
    countrySlug: ascent.countrySlug,
    cragSlug: ascent.cragSlug,
    name: ascent.zlaggableName,
    country: kebabToCap(ascent.countrySlug),
    date: undefined,
    day: undefined,
    dayOfWeek: undefined,
    firstAscent: ascent.firstAscent,
    flags: [] as string[],
    grade: fontToV[ascent.difficulty] || 'B', // grade conversion
    isHard: ascent.isHard,
    isSoft: ascent.isSoft,
    month: undefined,
    rating: ascent.rating,
    recommend: !!ascent.recommended, // 8a changed their response...
    secondGo: ascent.secondGo,
    sectorSlug: ascent.sectorSlug,
    softness: undefined,
    subArea: undefined,
    type: typeMap[ascent.type],
    year: undefined,
    zlaggableSlug: ascent.zlaggableSlug,
  }
  const flags = processedAscent.flags as string[]

  // New property "softness" = Soft, Hard, Neither
  const reldif = ascent.isEasy || ascent.isSoft ? 'Soft' : ascent.isHard ? 'Hard' : 'Neutral'
  processedAscent.softness = reldif

  // Add "Hard" or "soft" as a flag
  if (reldif != 'Neutral') {
    flags.push(reldif)
  }

  // Year and Month and Year are useful
  processedAscent.date = ascent.date.substring(0, 10)
  const date = decomposeDate(processedAscent.date as string)
  processedAscent.year = date.year
  processedAscent.month = date.month
  processedAscent.day = date.day

  // Day of week
  const jDate = new Date(processedAscent.date + 'T12:00:00Z')
  processedAscent.dayOfWeek = jDate.getDay()

  // Correct Area and Sub Area
  let areaSlug = ascent.areaSlug
  if (ascent.areaName) {
    const special = specialAreaCases[ascent.areaSlug]
    if (special) {
      processedAscent.destination = special.name
      processedAscent.area = special.name
      processedAscent.subArea = ascent.cragName

      // If this is a specail crag we need to split out the known "unique" sub areas
      if (special.uniqueSubAreas.includes(ascent.cragSlug)) {
        processedAscent.area = kebabToCap(ascent.cragSlug)
        processedAscent.subArea = kebabToCap(ascent.sectorSlug)
        if (
          special.uniqueSectorSlugs &&
          ascent.cragSlug in special.uniqueSectorSlugs &&
          special.uniqueSectorSlugs[ascent.cragSlug]!.includes(ascent.sectorSlug)
        ) {
          // This deep we lose some context, so area and subArea are duplicated
          processedAscent.area = kebabToCap(ascent.sectorSlug)
        }
      }
    } else {
      // Remove country code from area name ex Bishop (CA)
      processedAscent.area = ascent.areaName.replace(/ \([A-Z][A-Z]\)/, '')
      processedAscent.subArea = ascent.cragName
    }
  } else {
    processedAscent.area = ascent.cragName
    processedAscent.subArea = kebabToCap(ascent.sectorSlug)
    areaSlug = ascent.cragSlug
  }
  processedAscent.area = areaNameFixes[processedAscent.area as string] || processedAscent.area
  void areaSlug // kept for parity with the original (never used past this point)

  // Add a few more flags
  flags.push(processedAscent.type as string)

  if (ascent.firstAscent) flags.push('FA')
  if (ascent.secondGo) flags.push('Second Go')
  if (ascent.isOverhang) flags.push('isOverhang')
  if (ascent.isVertical) flags.push('isVertical')
  if (ascent.isSlab) flags.push('isSlab')
  if (ascent.isRoof) flags.push('isRoof')
  if (ascent.isAthletic) flags.push('isAthletic')
  if (ascent.isEndurance) flags.push('isEndurance')
  if (ascent.isCrimpy) flags.push('isCrimpy')
  if (ascent.isCruxy) flags.push('isCruxy')
  if (ascent.isSloper) flags.push('isSloper')
  if (ascent.isTechnical) flags.push('isTechnical')
  if (ascent.isDanger) flags.push('isDanger')
  if (ascent.withKneepad) flags.push('withKneepad')

  return processedAscent as ProcessedAscent
}

export function fetchData(sandboxId: string): Promise<unknown> {
  // Pretend fetching... return as promise
  return new Promise((resolve, reject) => {
    fetch(`/json/8a-scorecards/${sandboxId}.json`)
      .then((raw) => resolve(raw.json()))
      .catch((e) => {
        console.error(e)
        const ret = {
          msg: formatString('Sandbox member data for [{0}] not avaliable', sandboxId),
        }
        reject(ret)
      })
  })
}

export function prettyCapitalize(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

export interface ChartJsDataset {
  label?: string
  name?: string
  data: number[]
  backgroundColor?: string | string[]
}

export interface ChartJsData {
  datasets: ChartJsDataset[]
  labels: string[]
  names: StatKey[]
}

export interface PieChartOpts {
  filterFxn?: (stat: Stat) => boolean
  nameMap?: Record<string, string>
  aggregateFxn?: (stat: Stat) => number
  colors?: Record<string, string>
  sortByName?: boolean
  sortFxn?: (a: PieChartRow, b: PieChartRow) => number
  limit?: number
  splitStat?: string | null
  splitLimit?: number
}

// getPieChartData tags a handful of chart-only fields onto the Stat
// instances it reads (label/datum/color) rather than redesigning Stat itself
// to know about charting
type PieChartRow = Stat & { label?: string; datum?: number; color?: string }

export function getPieChartData(stat: Stat, opts: PieChartOpts): ChartJsData {
  const statList = Object.values(stat.subStats) as PieChartRow[]
  // Filter is given a filter function (shallow copy)
  let filteredList = [...statList]
  if (opts.filterFxn) {
    filteredList = filteredList.filter(opts.filterFxn)
  }
  // Add Label
  filteredList.forEach((el) => {
    el.label = mapName(stat.name as string, el.name, opts.nameMap)
  })
  // apply aggregate function
  filteredList.forEach((el) => (el.datum = opts.aggregateFxn ? opts.aggregateFxn(el) : el.count))
  // Add Color - To allow constant colors on update allow a passed color object
  filteredList.forEach((el, index) => {
    if (opts.colors) {
      // Add to the color options if we find ourself a elemnt we dont have yet
      if (!opts.colors[el.label as string]) {
        opts.colors[el.label as string] = getDistinctColor(index)
      }
      el.color = opts.colors[el.label as string]
    } else {
      el.color = getDistinctColor(index)
    }
  })
  // Sort data
  const defaultSort = opts.sortByName
    ? (a: PieChartRow, b: PieChartRow) => (String(a.name) > String(b.name) ? 1 : -1)
    : (a: PieChartRow, b: PieChartRow) => (b.datum as number) - (a.datum as number)
  filteredList.sort(opts.sortFxn || defaultSort)
  // Apply limit if passed
  if (opts.limit) filteredList = filteredList.slice(0, opts.limit)
  // Add actual data for that point
  let datasets: ChartJsDataset[] | undefined
  if (opts.splitStat) {
    // Apply a "split function"
    datasets = []
    const topSets: Set<StatKey>[] = []
    const maxSplits = opts.splitLimit as number

    // First pass find all the buckets - TODO: do this in one pass
    filteredList.forEach((row) => {
      const statsToSplit = Object.values(row.get(opts.splitStat as string).subStats)
      statsToSplit.sort((a, b) => b.count - a.count)
      const limit = Math.min(statsToSplit.length, maxSplits)
      const topSet = new Set<StatKey>()
      for (let i = 0; i < limit; i++) {
        const splitStat = statsToSplit[i]!
        topSet.add(splitStat.name)
        if (datasets!.find((ds) => ds.name === splitStat.name)) continue
        datasets!.push({
          label: mapName(opts.splitStat as string, splitStat.name, opts.nameMap),
          name: String(splitStat.name),
          data: [],
          backgroundColor: getDistinctColor(datasets!.length),
        })
      }
      topSets.push(topSet)
    })

    // Second pass fill all the buckets
    filteredList.forEach((row, index) => {
      const statsToSplit = row.get(opts.splitStat as string).subStats
      const topSet = topSets[index]!
      datasets!.forEach((ds) => {
        let el = statsToSplit[ds.name as string] || new Stat(ds.name as string)
        if (!topSet.has(ds.name as string)) el = new Stat(ds.name as string)
        ds.data.push(opts.aggregateFxn ? opts.aggregateFxn(el) : el.count)
      })
    })
  }
  // Return it in ChartJS format
  return {
    datasets: datasets || [
      {
        data: filteredList.map((el) => el.datum as number),
        backgroundColor: filteredList.map((el) => el.color as string),
      },
    ],
    labels: filteredList.map((el) => el.label as string),
    names: filteredList.map((el) => el.name),
  }
}

export interface GradeChartFilters {
  type?: { val?: string | null }
}

export function getGradeChartData(
  stat: Stat,
  allowExpansion = true,
  opts?: { filters?: GradeChartFilters },
): ChartJsData {
  const gradeList = Object.values(stat.subStats)
  gradeList.sort(
    (a, b) => (gradeMap[String(a.name)] as number) - (gradeMap[String(b.name)] as number),
  )
  const redpointDataset: ChartJsDataset = {
    label: 'Redpoint',
    data: [],
    backgroundColor: '#D70909', // Red
  }
  const flashDataset: ChartJsDataset = {
    label: 'Flash',
    data: [],
    backgroundColor: '#006DDB', // Blue
  }
  const onsiteDataset: ChartJsDataset = {
    label: 'Onsite',
    data: [],
    backgroundColor: '#e6c530', // Yellow
  }
  const datasets: ChartJsDataset[] = [redpointDataset, flashDataset, onsiteDataset]
  for (const grade of gradeList) {
    const types = grade.get('type', allowExpansion)
    let cnt = 0
    if (opts?.filters?.type?.val === 'redpoint') {
      cnt = grade.count
    } else if (types.get('redpoint', allowExpansion)) {
      cnt = types.get('redpoint', allowExpansion).count
    }
    redpointDataset.data.push(cnt)

    cnt = 0
    if (opts?.filters?.type?.val === 'flash') {
      cnt = grade.count
    } else if (types.get('flash', allowExpansion)) {
      cnt = types.get('flash', allowExpansion).count
    }
    flashDataset.data.push(cnt)

    cnt = 0
    if (opts?.filters?.type?.val === 'onsite') {
      cnt = grade.count
    } else if (types.get('onsite', allowExpansion)) {
      cnt = types.get('onsite', allowExpansion).count
    }
    onsiteDataset.data.push(cnt)
  }
  return {
    datasets: datasets,
    labels: gradeList.map((k) => 'V' + k.name),
    names: gradeList.map((k) => k.name),
  }
}

export function decomposeDate(dateStr: string): { day: string; month: string; year: string } {
  return {
    day: dateStr.substring(8, 10),
    month: dateStr.substring(5, 7),
    year: dateStr.substring(0, 4),
  }
}

/*
 * Time Series Functions
 */
export interface TimeSeriesTracker {
  top: number[]
  max: number
  avg: number
  score: number
  numMax: number
  cnt: number
}

export interface TimeSeriesRunTracker extends TimeSeriesTracker {
  sampledGrades: number[]
  prevMax: number
  sinceMax: number
  prevMaxDate?: Date
  sinceNewMax: number
  prevNewMaxDate?: Date
}

interface TimeSeriesState {
  date: { day: string; month: string; year: string }
  run: TimeSeriesRunTracker
  day: TimeSeriesTracker
  month: TimeSeriesTracker
  year: TimeSeriesTracker
}

export interface TimeSeriesPoint {
  x: Date
  y: TimeSeriesTracker
  yr?: TimeSeriesRunTracker
}

export interface TimeSeriesResult {
  day: TimeSeriesPoint[]
  month: TimeSeriesPoint[]
  year: TimeSeriesPoint[]
}

export interface TimeSeriesOpts {
  nTop?: number
  comparisonGrade?: number
  avgSamples?: number
}

export function generateTimeSeries(
  ascents: ProcessedAscent[],
  opts: TimeSeriesOpts = {},
): TimeSeriesResult | undefined {
  if (!opts.nTop) {
    opts.nTop = 10
  }
  let ts: TimeSeriesResult | undefined
  if (ascents.length > 0) {
    ts = { day: [], month: [], year: [] }
    // Sort ascents with earliest ascent first
    ascents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const now = decomposeDate(ascents[0]!.date)
    const t: TimeSeriesState = {
      date: {
        day: now.day,
        month: now.month,
        year: now.year,
      },
      run: {
        ...newTimeSeriesTracker(),
        sampledGrades: [],
        prevMax: 0,
        sinceMax: 0,
        prevMaxDate: undefined,
        sinceNewMax: 0,
        prevNewMaxDate: undefined,
      },
      day: newTimeSeriesTracker(),
      month: newTimeSeriesTracker(),
      year: newTimeSeriesTracker(),
    }
    let nowDate: Date = new Date()
    for (const ascent of ascents) {
      // Check if we are same, and roll day, month, year counters if need be
      const cur = decomposeDate(ascent.date)
      if (cur.year == t.date.year) {
        if (cur.month == t.date.month) {
          if (cur.day == t.date.day) {
            // Same Day of climbing dont roll (fisrt time through this is guaranteed)
          } else {
            rollDay(t, ts, nowDate)
          }
        } else {
          rollMonth(t, ts, nowDate)
        }
      } else {
        rollYear(t, ts, nowDate)
      }
      // now we know this is either a new day or the same day as last ascent
      t.date = { ...cur }
      const gradeNumerical = mapGrade(ascent.grade, 0) as number
      nowDate = new Date(parseInt(t.date.year), parseInt(t.date.month) - 1, parseInt(t.date.day))
      // Update Running tallies
      updateSinceMax(t, nowDate, gradeNumerical, opts.comparisonGrade)
      updateTop(t.run.top, gradeNumerical, opts.nTop)
      updateValues(t.run, gradeNumerical, opts.nTop)
      if (opts.avgSamples && opts.avgSamples > 0) {
        if (t.run.sampledGrades.length == opts.avgSamples) {
          t.run.sampledGrades.shift()
        }
        t.run.sampledGrades.push(gradeNumerical)
        t.run.avg = t.run.sampledGrades.reduce((a, b) => a + b, 0) / t.run.sampledGrades.length
      }
      // Update all top lists
      updateTop(t.day.top, gradeNumerical, opts.nTop)
      updateTop(t.month.top, gradeNumerical, opts.nTop)
      updateTop(t.year.top, gradeNumerical, opts.nTop)
      // Calculate the [Y] values
      updateValues(t.day, gradeNumerical, opts.nTop)
      updateValues(t.month, gradeNumerical, opts.nTop)
      updateValues(t.year, gradeNumerical, opts.nTop)
    }
    // final update
    rollYear(t, ts, nowDate)
  }
  console.log('Time Series Data:', ts)
  return ts
}

export function updateTop(topList: number[], newValue: number, nTop: number) {
  if (topList.length < nTop) {
    topList.push(newValue)
  } else if (topList[nTop - 1]! < newValue) {
    topList.pop()
    topList.push(newValue)
  }
  topList.sort((a, b) => b - a)
}

export function updateValues(
  tsTracker: TimeSeriesTracker,
  newValue: number,
  nTop: number,
  // kept for parity with the original signature, which never used it either
  _avgSamples?: number,
) {
  tsTracker.cnt += 1
  if (newValue == tsTracker.max) {
    tsTracker.numMax += 1
  } else if (newValue > tsTracker.max) {
    tsTracker.numMax = 1
  }
  tsTracker.max = Math.max(newValue, tsTracker.max)
  tsTracker.avg = (newValue + (tsTracker.cnt - 1) * tsTracker.avg) / tsTracker.cnt
  tsTracker.score = tsTracker.top.reduce((a, b) => a + b, 0) / Math.min(nTop, tsTracker.top.length)
}

export function updateSinceMax(
  t: { run: TimeSeriesRunTracker },
  now: Date,
  gradeNumerical: number,
  comparisonGradeOpt?: number,
) {
  const compGrade =
    comparisonGradeOpt !== undefined && comparisonGradeOpt > -1 ? comparisonGradeOpt : t.run.max
  if (gradeNumerical >= compGrade) {
    if (gradeNumerical > compGrade) {
      t.run.prevNewMaxDate = new Date(now)
    }
    t.run.prevMaxDate = new Date(now)
  }
  if (t.run.prevMaxDate) {
    const diffTime = Math.abs(now.getTime() - t.run.prevMaxDate.getTime())
    t.run.sinceMax = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  if (t.run.prevNewMaxDate) {
    const diffTime = Math.abs(now.getTime() - t.run.prevNewMaxDate.getTime())
    t.run.sinceNewMax = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

export function newTimeSeriesTracker(): TimeSeriesTracker {
  return { top: [], max: 0, avg: 0, score: 0, numMax: 0, cnt: 0 }
}

function rollYear(t: TimeSeriesState, ts: TimeSeriesResult, now: Date) {
  ts.year.push({
    x: new Date(parseInt(t.date.year), 12, 30),
    y: t.year,
  })
  t.year = newTimeSeriesTracker()
  rollMonth(t, ts, now)
}

function rollMonth(t: TimeSeriesState, ts: TimeSeriesResult, now: Date) {
  ts.month.push({
    x: new Date(parseInt(t.date.year), parseInt(t.date.month) - 1, 28),
    y: t.month,
  })
  t.month = newTimeSeriesTracker()
  rollDay(t, ts, now)
}

function rollDay(t: TimeSeriesState, ts: TimeSeriesResult, now: Date) {
  ts.day.push({
    x: new Date(now),
    y: t.day,
    yr: {
      ...t.run,
      prevMaxDate: t.run.prevMaxDate ? new Date(t.run.prevMaxDate) : undefined,
      top: [...t.run.top],
    },
  })
  t.day = newTimeSeriesTracker()
}

/*
 * Crossword Chart Data Builder
 */
export interface XwordSeriesOpt {
  color: string
  borderWidth: number
  label: string
}

export function buildXwordChartData(data: number[][], seriesOpts: XwordSeriesOpt[]) {
  const datasets = seriesOpts.map((seriesOpt) => ({
    backgroundColor: seriesOpt.color,
    borderColor: seriesOpt.color,
    borderWidth: seriesOpt.borderWidth,
    label: seriesOpt.label,
    fill: false,
    pointRadius: 2,
    pointBackgroundColor: seriesOpt.color,
    pointBorderColor: seriesOpt.color,
    data: [] as { x: number; y: number }[],
  }))
  for (const datum of data) {
    for (let j = 0; j < seriesOpts.length; j++) {
      const ds = datasets[j]!
      // remove duplicate values
      if (ds.data.length > 0) {
        const prevY = ds.data[ds.data.length - 1]!.y
        if (prevY === datum[j + 1]) {
          continue
        }
      }
      ds.data.push({ x: datum[0]!, y: datum[j + 1]! })
    }
  }
  // add a final point at final time to make graphs go to end
  const lastRow = data[data.length - 1]!
  const tf = lastRow[0]!
  for (let j = 0; j < seriesOpts.length; j++) {
    const ds = datasets[j]!
    ds.data.push({
      x: tf,
      y: ds.data[ds.data.length - 1]!.y,
    })
  }
  return {
    datasets: datasets,
  }
}
