<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartOptions } from 'chart.js'
import LineGraph from '@/components/charts/LineGraph.vue'
import { buildXwordChartData } from '@/utils/Utils'
import type { XwordStats, XwordStatData } from './Xword'
import type { SetOptionPayload } from './types'

const props = defineProps<{
  isCompleted: boolean
  showErrors: boolean
  stats: XwordStats | Record<string, never>
  statData: XwordStatData
}>()

const emit = defineEmits<{
  setOption: [payload: SetOptionPayload]
  clear: [type: 'flags' | 'wrong' | 'clue' | 'puzzle']
  solve: [type: 'cell' | 'clue' | 'puzzle']
}>()

const showFinishHelp = ref(false)
const showStatHelp = ref(false)
const showMore = ref(false)

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Crossword Progress',
      font: { size: 20 },
    },
    legend: {
      position: 'bottom',
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
      type: 'linear',
      title: { display: true, text: 'Time (sec)', font: { size: 14 } },
    },
    y: {
      title: { display: true, text: 'Number Cells', font: { size: 14 } },
    },
  },
}

const seriesOpts = [
  { color: '#6d826c', borderWidth: 2, label: 'Filled' },
  { color: '#32ab2e', borderWidth: 2, label: 'Correct' },
  { color: '#d6b10b', borderWidth: 2, label: 'Auto-Solved' },
  { color: '#cc4027', borderWidth: 2, label: 'Shown Wrong' },
  { color: '#38a0a6', borderWidth: 2, label: 'Wrong Cleared' },
]

const chartData = computed(() => buildXwordChartData(props.statData.timeSeries, seriesOpts))

// only read once isCompleted is true (the v-else template branch), by which
// point Xword.generateStats() has populated this beyond its initial {}
const xwordStats = computed(() => props.stats as XwordStats)

const formattedTime = computed(() => {
  const stats = xwordStats.value
  const hours = Math.floor((stats.time / (60 * 24)) % 100)
  const minutes = Math.floor(stats.time / 60) % 60
  const seconds = stats.time % 60
  let ret = ''
  if (hours > 0) {
    ret += hours + ' hour'
    ret += hours > 1 ? 's, ' : ', '
  }
  if (hours > 0 || minutes > 0) {
    ret += minutes + ' minute'
    ret += minutes > 1 ? 's, ' : ', '
  }
  ret += seconds + ' second'
  ret += seconds > 1 ? 's' : ''
  return ret
})

function statWithPercent(stat: number, total: number): string {
  const perc = Math.round((stat / total) * 100)
  return stat + ' (' + perc + '%)'
}
function rickRoll() {
  window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')?.focus()
}
</script>

<template>
  <div id="x-stat" class="bg1">
    <div class="stat-body">
      <div v-if="!isCompleted">
        <div class="stat-head">
          Finishing Crossword
          <i class="fas fa-question-circle icn" @click="showFinishHelp = !showFinishHelp"></i>
        </div>
        <div class="stat-help" v-if="showFinishHelp">
          <ul style="list-style-type: none">
            <li class="help-itm">
              <strong>[ Submit ]</strong> - Sumbit your current puzzle. All wrong entries will be
              auto-solved and some basic statistics will be shown.
            </li>
            <li class="help-itm">
              <strong>[ Clear Wrong Answers ]</strong> - All wrong entries will be cleared.
            </li>
            <li class="help-itm">
              <strong>[ Show Errors ]</strong> - Turn on the setting "Show Errors" which will
              highlight all wrong answers in red. This will only turn on the setting for teh
              duration of this puzzle.
            </li>
          </ul>
        </div>
        <div class="btn-wrap">
          <div class="stat-btn" @click="emit('solve', 'puzzle')">Submit</div>
        </div>
        <div class="btn-wrap">
          <div class="stat-btn" @click="emit('clear', 'wrong')">Clear Wrong Answers</div>
        </div>
        <div class="btn-wrap">
          <div
            class="stat-btn"
            @click="
              emit('setOption', {
                optionPath: ['errors', 'showErrors'],
                value: !showErrors,
                dontSave: true,
              })
            "
          >
            <span v-if="showErrors">Hide</span>
            <span v-else>Show</span> Errors
          </div>
        </div>
      </div>
      <div v-else>
        <div class="stat-head">
          Statistics
          <i class="fas fa-question-circle icn" @click="showStatHelp = !showStatHelp"></i>
        </div>
        <div class="stat-help" v-if="showStatHelp">
          <ul style="list-style-type: none">
            <li class="help-itm">
              <strong>[ Solve Time ]</strong> - How long the puzzle took to solve. Note that timer
              starts once crossword is opened and will continue to run while the page is open.
            </li>
            <li class="help-itm">
              <strong>[ Score ]</strong> - The number represents how many cells you manually entered
              correctly without the direct usage of tools. The percent is calculated as (score /
              total input cells) * 100
            </li>
            <li class="help-itm">
              <strong>[ ...more stats ]</strong> - Click this to see more stats including a graph
              showing your progress over time. Will read as "...less stats" when expanded.
            </li>
            <li class="help-itm">
              <strong>[ Total Cells ]</strong> - Total number of cells including black.
            </li>
            <li class="help-itm">
              <strong>[ Input Cells ]</strong> - Total number of input cells. Percent is calculated
              as (input cells / total cells) * 100
            </li>
            <li class="help-itm">
              <strong>[ Auto Solved ]</strong> - Total number of cells solved via one of the "solve"
              tools. The cell in the grid will be highlighted green.
            </li>
            <li class="help-itm">
              <strong>[ Shown Error ]</strong> - Total number of cells that were colored red at some
              point to indicate an error. This will only be non-zero if the setting "Show Errors" is
              set to true.
            </li>
            <li class="help-itm">
              <strong>[ Wrong Cleared ]</strong> - Total number of cells that were cleared using the
              tool "Clear wrong entries".
            </li>
            <li class="help-itm">
              <strong>[ Crossword Progress ]</strong> - A chart.js graph that shows the above counts
              over time. Note that you can click the individal entries in the legend to show/hide
              each individual data series and the graph will rescale dynamically. You can also pan
              and zoom the chart.
            </li>
          </ul>
        </div>
        <div v-show="showStatHelp" class="closer icn" @click="showStatHelp = false">
          ...hide help
          <i class="fas fa-caret-up"></i>
        </div>
        <div class="stat-row">
          <div class="stat-type">Solve Time :</div>
          <div class="stat-val">{{ formattedTime }}</div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Score :</div>
          <div class="stat-val" @click="rickRoll()">
            {{ statWithPercent(xwordStats.numTrulySolved, xwordStats.inputCells) }}
          </div>
        </div>

        <div class="stat-more icn" @click="showMore = !showMore">
          <span v-if="!showMore">
            ...more stats
            <i class="fas fa-caret-down"></i>
          </span>
          <span v-else>
            ...less stats
            <i class="fas fa-caret-up"></i>
          </span>
        </div>
        <div v-show="showMore">
          <div class="stat-row">
            <div class="stat-type">Total Cells :</div>
            <div class="stat-val">{{ xwordStats.totalCells }}</div>
          </div>
          <div class="stat-row">
            <div class="stat-type">Input Cells :</div>
            <div class="stat-val">
              {{ statWithPercent(xwordStats.inputCells, xwordStats.totalCells) }}
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-type">Auto-Solved :</div>
            <div class="stat-val">
              {{ statWithPercent(xwordStats.numAutoSolved, xwordStats.inputCells) }}
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-type">Shown Error :</div>
            <div class="stat-val">
              {{ statWithPercent(xwordStats.numShownError, xwordStats.inputCells) }}
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-type">Wrong Cleared :</div>
            <div class="stat-val">
              {{ statWithPercent(xwordStats.numCleared, xwordStats.inputCells) }}
            </div>
          </div>
          <div class="bg1 chart-container">
            <LineGraph :chartData="chartData" :options="options" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#x-stat {
  .stat-head {
    font-weight: bold;
    font-size: 22px;
  }
  .stat-help {
    display: flex;
    justify-content: center;
  }
  .help-itm {
    margin-top: 0.4em;
    margin-bottom: 0.4em;
  }
  .stat-row {
    display: flex;
    justify-content: left;
    margin-left: 10%;
    .stat-type {
      flex-basis: 45%;
      text-align: right;
      margin-right: 1em;
      font-weight: bold;
    }
    .stat-val {
      max-width: 45%;
      text-align: left;
    }
  }
  .closer {
    margin-top: -0.25em;
    margin-bottom: 1em;
  }
  .btn-wrap {
    display: flex;
    justify-content: center;
    .stat-btn {
      flex-basis: 100px;
      flex-grow: 1;
      max-width: 250px;
      border-radius: 0.35em;
      cursor: pointer;
      padding: 5px 10px;
      margin: 3px;
      font-size: 14px;
    }
  }
  .chart-container {
    margin: 7px;
    height: 400px;
  }
  .stat-body {
    padding: 7px;
  }
}
</style>
