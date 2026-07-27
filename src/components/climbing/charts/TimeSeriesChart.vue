<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartOptions, ChartData, LegendItem } from 'chart.js'
import Stat from '@/utils/Stat'
import { mapGrade, generateTimeSeries } from '@/utils/Utils'
import LineGraph from '@/components/charts/LineGraph.vue'

const props = defineProps<{
  stat: Stat
  uniqueGrades: number[]
}>()

defineEmits<{
  close: []
}>()

interface CheckOpt {
  label: string
  value: boolean
  type: 'check'
}
interface SelectOpt {
  label: string
  value: number
  type: 'select'
  values: number[]
  negOneName: string
}

const selectedDay = ref<Date | undefined>(undefined)
const showOptions = ref(false)

const chartOpts = ref<{ normalize: CheckOpt; sinceGrade: SelectOpt; avgSamples: SelectOpt }>({
  normalize: { label: 'Normalize Data', value: false, type: 'check' },
  sinceGrade: {
    label: "'Since' Grade",
    value: -1,
    type: 'select',
    values: [...props.uniqueGrades, -1],
    negOneName: 'Max',
  },
  avgSamples: {
    label: "Average Samples, (last 'N'):",
    value: -1,
    type: 'select',
    values: [5, 10, 25, 50, 100, -1],
    negOneName: 'All',
  },
})

const showCache = ref([false, true, false, true, false])

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_event, elements, chart) => {
    if (elements.length != 0) {
      const first = elements[0]!
      const dataset = chart.data.datasets[first.datasetIndex] as unknown as
        { data: { x: Date; y: number }[] } | undefined
      selectedDay.value = dataset?.data[first.index]?.x
    } else {
      selectedDay.value = undefined
    }
  },
  plugins: {
    title: {
      display: false,
    },
    legend: {
      position: 'bottom',
      onClick: (_event, legendItem: LegendItem) => {
        const newCache = [...showCache.value]
        newCache[legendItem.datasetIndex!] = !!legendItem.hidden
        showCache.value = newCache
      },
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy',
      },
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy',
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      title: { display: false },
      time: { unit: 'year' },
    },
    y: {
      title: { display: false },
      min: 0,
    },
  },
}

const ascentTitle = computed(() => `Day Ascents (${selectedAscents.value.length})`)
const maxAscentTitle = computed(
  () => `Ascents at V${maxToDate.value.grade} (${maxToDate.value.ascents.length})`,
)

function toStatDateString(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + d.getDate()).slice(-2)
  )
}

interface AscentLike {
  name: string
  grade: string
  date: string
}

const selectedAscents = computed<AscentLike[]>(() => {
  let ret: AscentLike[] = []
  if (selectedDay.value) {
    ret = props.stat.get('date').get(toStatDateString(selectedDay.value))
      .values as unknown as AscentLike[]
  }
  return ret
})

const maxToDate = computed(() => {
  if (selectedDay.value) {
    const dateStr = toStatDateString(selectedDay.value)
    const filteredAscents = ([...props.stat.values] as unknown as AscentLike[]).filter(
      (ascent) => ascent.date <= dateStr,
    )
    let maxGrade = 0
    let maxAscents: AscentLike[] = []
    for (const ascent of filteredAscents) {
      const numericalGrade = mapGrade(ascent.grade) as number
      if (numericalGrade > maxGrade) {
        maxGrade = numericalGrade
        maxAscents = [ascent]
      } else if (maxGrade == numericalGrade) {
        maxAscents.push(ascent)
      }
    }
    return { grade: '' + maxGrade, ascents: maxAscents }
  }
  return { grade: '-', ascents: [] as AscentLike[] }
})

interface TimeSeriesDataset {
  data: { x: Date; y: number }[]
  backgroundColor: string
  borderColor: string
  borderWidth: number
  label: string
  fill: boolean
  pointRadius: number
  pointBackgroundColor: string
  pointBorderColor: string
  hidden?: boolean
}

function createDataset(
  data: { x: Date; y: number }[],
  opts: { color: string; label: string },
): TimeSeriesDataset {
  return {
    data: data,
    backgroundColor: opts.color,
    borderColor: opts.color,
    borderWidth: 2,
    label: opts.label,
    fill: false,
    pointRadius: 2,
    pointBackgroundColor: opts.color,
    pointBorderColor: opts.color,
  }
}

const chartData = computed<ChartData<'line'>>(() => {
  const ts = generateTimeSeries([...props.stat.values] as never[], {
    comparisonGrade: chartOpts.value.sinceGrade.value,
    avgSamples: chartOpts.value.avgSamples.value,
  })
  const data: Record<
    'sinceMax' | 'max' | 'avg' | 'numMax' | 'sinceNewMax',
    { x: Date; y: number }[]
  > = {
    sinceMax: [],
    max: [],
    avg: [],
    numMax: [],
    sinceNewMax: [],
  }
  let normalizer = { sinceMax: 1, max: 1, avg: 1, numMax: 1, sinceNewMax: 1 }
  if (ts) {
    if (chartOpts.value.normalize.value) {
      normalizer = {
        sinceMax: Math.max(...ts.day.map((el) => el.yr!.sinceMax), 1),
        max: Math.max(...ts.day.map((el) => el.yr!.max), 1),
        avg: Math.max(...ts.day.map((el) => el.yr!.avg), 1),
        numMax: Math.max(...ts.day.map((el) => el.yr!.numMax), 1),
        sinceNewMax: Math.max(...ts.day.map((el) => el.yr!.sinceNewMax), 1),
      }
    }
    ts.day.forEach((el) => {
      const yr = el.yr!
      data.max.push({ x: el.x, y: yr.max / normalizer.max })
      data.sinceMax.push({ x: el.x, y: yr.sinceMax / normalizer.sinceMax })
      data.numMax.push({ x: el.x, y: yr.numMax / normalizer.numMax })
      data.avg.push({ x: el.x, y: yr.avg / normalizer.avg })
      data.sinceNewMax.push({ x: el.x, y: yr.sinceNewMax / normalizer.sinceNewMax })
    })
  }

  // Return it in ChartJS format
  const datasets: TimeSeriesDataset[] = []
  datasets.push({
    ...createDataset(data.sinceMax, { color: '#6d826c', label: 'Days Since' }),
    hidden: !showCache.value[0],
  })
  datasets.push({
    ...createDataset(data.max, { color: '#32ab2e', label: 'Max Grade' }),
    hidden: !showCache.value[1],
  })
  datasets.push({
    ...createDataset(data.avg, { color: '#cc4027', label: 'Average Grade' }),
    hidden: !showCache.value[2],
  })
  datasets.push({
    ...createDataset(data.numMax, { color: '#38a0a6', label: 'Ascents at Max' }),
    hidden: !showCache.value[3],
  })
  if (chartOpts.value.sinceGrade.value < 0) {
    datasets.push({
      ...createDataset(data.sinceNewMax, { color: '#FFDF00', label: 'Days Since New Grade' }),
      hidden: !showCache.value[4],
    })
  }
  return { datasets: datasets as unknown as ChartData<'line'>['datasets'] }
})
</script>

<template>
  <div class="chart-ts bg1">
    <div>
      <div class="chart-header">
        <span>
          <i class="fas icn fa-chart-line icn-a"></i>
        </span>
        <span class="middle"></span>
        <i class="fas fa-window-close icn" @click="$emit('close')" v-tooltip="'Discard Chart'"></i>
      </div>
    </div>
    <h2>
      Time Series
      <i
        @click="showOptions = !showOptions"
        class="fas icn fa-cog"
        :class="{ 'icn-a': showOptions }"
      ></i>
    </h2>
    <div v-if="showOptions" class="settings-container">
      <div class="settings-h">Settings</div>
      <div class="settings-block">
        <table class="basic-table">
          <tr v-for="(opt, optKey) in chartOpts" :key="optKey">
            <td>{{ opt.label }}</td>
            <td v-if="opt.type == 'check'">
              <input type="checkbox" id="checkbox" v-model="opt.value" />
            </td>
            <td v-else>
              <select v-model="opt.value">
                <option v-for="vName in opt.values" :value="vName" :key="vName">
                  {{ vName == -1 ? opt.negOneName : vName }}
                </option>
              </select>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <LineGraph class="chart-container" :chartData="chartData" :options="options" />
    <div class="settings-container">
      <div v-if="selectedDay">
        <div class="settings-block">
          <div class="settings-h">
            {{ ascentTitle }}
          </div>
          <ul style="list-style: none">
            <li v-for="(ascent, index) in selectedAscents" :key="index">
              <span class="b">{{ ascent.name }}</span>
              (V{{ ascent.grade }}), {{ ascent.date }}
            </li>
          </ul>
        </div>
        <div class="settings-block">
          <div class="settings-h">
            {{ maxAscentTitle }}
          </div>
          <ul style="list-style: none">
            <li v-for="(ascent, index) in maxToDate.ascents" :key="index">
              <span class="b">{{ ascent.name }}</span>
              (V{{ ascent.grade }}), {{ ascent.date }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  .middle {
    flex-grow: 1;
    flex-basis: 10px;
  }
}
.settings-container {
  max-width: 450px;
  margin: auto;
}
.settings-block {
  padding: 5px;
  margin: 5px;
}
.chart-container {
  height: 400px;
}
.settings-h {
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: large;
}
</style>
