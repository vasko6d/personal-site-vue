<template>
  <div class="chart-ts bg1">
    <div>
      <div class="chart-header">
        <span>
          <i class="fas icn fa-chart-line icn-a"></i>
        </span>
        <span class="middle"></span>
        <i
          class="fas fa-window-close icn"
          @click="$emit('close')"
          v-tooltip="'Discard Chart'"
        ></i>
      </div>
    </div>
    <h2>{{ title }}</h2>

    <line-graph
      class="chart-container"
      v-if="viewType == 'chart'"
      :chartData="chartData"
      :options="options"
    />
    <div class="settings-container">
      <div class="settings-block">
        <h4>Data Options</h4>
        <table class="basic-table">
          <tr v-for="(opt, optKey) in chartOpts" :key="optKey">
            <td>{{ opt.label }}</td>
            <td v-if="opt.type == 'check'">
              <input type="checkbox" id="checkbox" v-model="opt.value" />
            </td>
            <td v-else>
              <select v-model="opt.value">
                <option
                  v-for="vName in opt.values"
                  :value="vName"
                  :key="vName.id"
                  >{{ vName == -1 ? opt.negOneName : vName }}</option
                >
              </select>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
import Utils from "@/mixins/Utils.js";
import LineGraph from "@/components/charts/LineGraph.vue";
export default {
  name: "TimeSeries",
  mixins: [Utils],
  components: {
    LineGraph,
  },
  props: {
    ascents: Array,
    uniqueGrades: Array,
  },
  data() {
    return {
      viewType: "chart", // "settings", "ascents",
      chartOpts: {
        normalize: { label: "Normalize Data", value: false, type: "check" },
        sinceGrade: {
          label: "'Since' Grade",
          value: -1,
          type: "select",
          values: [...this.uniqueGrades, -1],
          negOneName: "Max",
        },
        avgSamples: {
          label: "Average Samples, (last 'N'):",
          value: -1,
          type: "select",
          values: [5, 10, 25, 50, 100, -1],
          negOneName: "All",
        },
      },
      showCache: [false, true, false, true, false],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: false,
        },
        legend: {
          position: "bottom",
          onClick: (e, legendItem) => {
            let newCache = [...this.showCache];
            newCache[legendItem.datasetIndex] = legendItem.hidden;
            this.showCache = newCache;
          },
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
    title() {
      return this.viewType == "chart" ? "Time Series" : "Settings";
    },
    chartData() {
      let ts = this.generateTimeSeries([...this.ascents], {
        comparisonGrade: this.chartOpts.sinceGrade.value,
        avgSamples: this.chartOpts.avgSamples.value,
      });
      let data = {
        sinceMax: [],
        max: [],
        avg: [],
        numMax: [],
        sinceNewMax: [],
      };
      let normalizer = {
        sinceMax: 1,
        max: 1,
        avg: 1,
        numMax: 1,
        sinceNewMax: 1,
      };
      if (ts) {
        if (this.chartOpts.normalize.value) {
          normalizer = {
            sinceMax: Math.max(...ts.day.map((el) => el.yr.sinceMax), 1),
            max: Math.max(...ts.day.map((el) => el.yr.max), 1),
            avg: Math.max(...ts.day.map((el) => el.yr.avg), 1),
            numMax: Math.max(...ts.day.map((el) => el.yr.numMax), 1),
            sinceNewMax: Math.max(...ts.day.map((el) => el.yr.sinceNewMax), 1),
          };
        }
        ts.day.forEach((el) => {
          data.max.push({ x: el.x, y: el.yr.max / normalizer.max });
          data.sinceMax.push({
            x: el.x,
            y: el.yr.sinceMax / normalizer.sinceMax,
          });
          data.numMax.push({
            x: el.x,
            y: el.yr.numMax / normalizer.numMax,
          });
          data.avg.push({ x: el.x, y: el.yr.avg / normalizer.avg });
          data.sinceNewMax.push({
            x: el.x,
            y: el.yr.sinceNewMax / normalizer.sinceNewMax,
          });
        });
      }

      // Return it in ChartJS format
      let ret = { datasets: [] };
      ret.datasets.push({
        ...this.createDataset(data.sinceMax, {
          color: "#6d826c",
          label: "Days Since",
        }),
        hidden: !this.showCache[0],
      });
      ret.datasets.push({
        ...this.createDataset(data.max, {
          color: "#32ab2e",
          label: "Max Grade",
        }),
        hidden: !this.showCache[1],
      });
      ret.datasets.push({
        ...this.createDataset(data.avg, {
          color: "#cc4027",
          label: "Average Grade",
        }),
        hidden: !this.showCache[2],
      });
      ret.datasets.push({
        ...this.createDataset(data.numMax, {
          color: "#38a0a6",
          label: "Ascents at Max",
        }),
        hidden: !this.showCache[3],
      });
      if (this.chartOpts.sinceGrade.value < 0) {
        ret.datasets.push({
          ...this.createDataset(data.sinceNewMax, {
            color: "#FFDF00",
            label: "Days Since New Grade",
          }),
          hidden: !this.showCache[4],
        });
      }
      return ret;
    },
  },
  methods: {
    createDataset(data, opts) {
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
      };
    },
  },
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
.settings-block {
  padding: 5px;
  margin: 5px;
}
.chart-container {
  height: 400px;
}
</style>
