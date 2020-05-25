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
            <td>
              <input type="checkbox" id="checkbox" v-model="opt.enable" />
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
      chartOpts: {
        normalize: { label: "Normalize Data", enable: true },
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
    title() {
      return this.viewType == "chart" ? "Time Series" : "Settings";
    },
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
        if (this.chartOpts.normalize.enable) {
          normalizer = {
            sinceMax: Math.max(...ts.day.map((el) => el.yr.sinceMax), 11),
            max: Math.max(...ts.day.map((el) => el.yr.max), 1),
            avg: Math.max(...ts.day.map((el) => el.yr.avg), 1),
            numMax: Math.max(...ts.day.map((el) => el.yr.numMax), 1),
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
        });
      }

      // Return it in ChartJS format
      let ret = { datasets: [] };
      ret.datasets.push(
        this.createDataset(data.sinceMax, {
          color: "#6d826c",
          label: "Days Since Max",
        })
      );
      ret.datasets.push(
        this.createDataset(data.max, {
          color: "#32ab2e",
          label: "Max Grade",
        })
      );
      ret.datasets.push({
        ...this.createDataset(data.avg, {
          color: "#cc4027",
          label: "Average Grade",
        }),
        hidden: true,
      });
      ret.datasets.push(
        this.createDataset(data.numMax, {
          color: "#38a0a6",
          label: "Ascents at Max",
        })
      );
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
