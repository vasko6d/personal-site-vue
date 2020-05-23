<template>
  <div class="chart-ts bg1">
    <div>
      <div class="chart-header">
        <span>
          <i
            class="fas fa-mountain icn"
            :class="{
              'icn-a': viewType === 'ascents',
            }"
            @click="viewType = 'ascents'"
            v-tooltip="'Show Ascents'"
          ></i
          >&nbsp;|&nbsp;
        </span>
        <span>
          <i
            class="fas fa-cogs icn"
            :class="{
              'icn-a': viewType === 'settings',
            }"
            @click="viewType = 'settings'"
            v-tooltip="'Settings'"
          ></i
          >&nbsp;|&nbsp;
        </span>
        <span>
          <i
            class="fas icn fa-chart-line"
            :class="{
              'icn-a': viewType === 'chart',
            }"
            @click="viewType = 'chart'"
          ></i>
        </span>
        <span class="middle"></span>
        <i
          class="fas fa-window-close icn"
          @click="$emit('close')"
          v-tooltip="'Discard Chart'"
        ></i>
      </div>
    </div>
    <h2>
      {{
        viewType == "chart"
          ? "Time Series"
          : viewType == "settings"
          ? "Settings"
          : "Ascents"
      }}
    </h2>
    <line-graph
      v-if="viewType == 'chart'"
      :chartData="chartData"
      :options="options"
    />
    <ascent-view
      v-else-if="viewType === 'ascents'"
      :chart="chart"
      :stats="stats"
    />
    <div v-else-if="viewType === 'settings'" class="settings-container">
      <div>Possible Data</div>
      <table class="basic-table">
        <tr
          v-for="(opt, showOptKey) in viewOpts.possibleSeries"
          :key="showOptKey"
        >
          <td class="b">{{ opt.label }}</td>
          <td>
            <input type="checkbox" id="checkbox" v-model="opt.show" />
          </td>
        </tr>
      </table>
      <div>Data Options</div>
      <table class="basic-table">
        <tr v-for="(opt, optKey) in viewOpts.general" :key="optKey">
          <td class="b">{{ opt.label }}</td>
          <td>
            <input type="checkbox" id="checkbox" v-model="opt.enable" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
import Utils from "@/mixins/Utils.js";
import LineGraph from "@/components/charts/LineGraph2.vue";
export default {
  name: "TimeSeries",
  mixins: [Utils],
  components: {
    LineGraph,
  },
  props: {
    ascents: Array,
  },
  data() {
    return {
      viewType: "chart", // "settings", "ascents",
      viewOpts: {
        possibleSeries: {
          max: { label: "Max Grade", show: true },
          sinceMax: { label: "Days Since Max", show: true },
          numMax: { label: "Ascents at Max", show: true },
          avg: { label: "Average Grade", show: true },
        },
        general: {
          normalize: { label: "Normalize?", enable: true },
        },
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: false,
        },
        legend: {
          position: "bottom",
        },
        scales: {
          xAxes: [
            {
              type: "time",
              scaleLabel: {
                display: false,
              },
              time: {
                unit: "year",
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: false,
              },
              ticks: {
                min: 0,
              },
            },
          ],
        },
        pan: {
          enabled: true,
          mode: "xy",
          speed: 10,
          threshold: 10,
        },
        zoom: {
          enabled: true,
          drag: false,

          // Zooming directions. Remove the appropriate direction to disable
          // Eg. 'y' would only allow zooming in the y direction
          mode: "xy",
        },
      },
    };
  },
  computed: {
    chartData() {
      let ts = this.generateTimeSeries([...this.ascents], 10);
      let data = {
        sinceMax: [],
        max: [],
        avg: [],
        numMax: [],
      };
      let normalizer = {
        sinceMax: 1,
        max: 1,
        avg: 1,
        numMax: 1,
      };
      if (ts) {
        if (this.viewOpts.general.normalize.enable) {
          normalizer = {
            sinceMax: Math.max(...ts.day.map((el) => el.yr.sinceMax), 11),
            max: Math.max(...ts.day.map((el) => el.yr.max), 1),
            avg: Math.max(...ts.day.map((el) => el.yr.avg), 1),
            numMax: Math.max(...ts.day.map((el) => el.yr.numMax), 1),
          };
        }
        ts.day.forEach((el) => {
          if (this.viewOpts.possibleSeries.max.show) {
            data.max.push({ x: el.x, y: el.yr.max / normalizer.max });
          }
          if (this.viewOpts.possibleSeries.sinceMax.show) {
            data.sinceMax.push({
              x: el.x,
              y: el.yr.sinceMax / normalizer.sinceMax,
            });
          }
          if (this.viewOpts.possibleSeries.numMax.show) {
            data.numMax.push({
              x: el.x,
              y: el.yr.numMax / normalizer.numMax,
            });
          }
          if (this.viewOpts.possibleSeries.avg.show) {
            data.avg.push({ x: el.x, y: el.yr.avg / normalizer.avg });
          }
        });
      }

      // Return it in ChartJS format
      let ret = { datasets: [] };
      if (this.viewOpts.possibleSeries.sinceMax.show) {
        ret.datasets.push({
          data: data.sinceMax,
          backgroundColor: "#6d826c",
          borderColor: "#6d826c",
          borderWidth: 2,
          label: "Days Since Max",
          fill: false,
          pointRadius: 2,
          pointBackgroundColor: "#6d826c",
          pointBorderColor: "#6d826c",
        });
      }
      if (this.viewOpts.possibleSeries.max.show) {
        ret.datasets.push({
          data: data.max,
          backgroundColor: "#32ab2e",
          borderColor: "#32ab2e",
          borderWidth: 2,
          label: "Max Grade",
          fill: false,
          pointRadius: 2,
          pointBackgroundColor: "#32ab2e",
        });
      }
      if (this.viewOpts.possibleSeries.avg.show) {
        ret.datasets.push({
          data: data.avg,
          backgroundColor: "#cc4027",
          borderColor: "#cc4027",
          borderWidth: 2,
          label: "Average Grade",
          fill: false,
          pointRadius: 2,
          pointBackgroundColor: "#cc4027",
          pointBorderColor: "#cc4027",
        });
      }
      if (this.viewOpts.possibleSeries.numMax.show) {
        ret.datasets.push({
          data: data.numMax,
          backgroundColor: "#38a0a6",
          borderColor: "#38a0a6",
          borderWidth: 2,
          label: "Ascents at Max",
          fill: false,
          pointRadius: 2,
          pointBackgroundColor: "#38a0a6",
          pointBorderColor: "#38a0a6",
        });
      }
      return ret;
    },
  },
  methods: {},
};
</script>

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
</style>
