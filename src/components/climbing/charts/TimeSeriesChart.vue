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
    <h2>
      Time Series
      <i
        @click="showOptions = !showOptions"
        class="fas icn fa-cog"
        :class="{ 'icn-a': showOptions }"
      ></i>
    </h2>
    <div v-if="showOptions" class="settings-container">
      <div class="settings-h">
        Settings
      </div>
      <div class="settings-block">
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
    <line-graph
      class="chart-container"
      :chartData="chartData"
      :options="options"
    />
    <div class="settings-container">
      <div v-if="selectedDay">
        <div class="settings-block">
          <div class="settings-h">
            {{ ascentTitle }}
          </div>
          <ul style="list-style: none;">
            <li v-for="ascent in selectedAscents" :key="ascent.id">
              <span class="b">{{ ascent.name }}</span>
              (V{{ ascent.grade }}), {{ ascent.date }}
            </li>
          </ul>
        </div>
        <div class="settings-block">
          <div class="settings-h">
            {{ maxAscentTitle }}
          </div>
          <ul style="list-style: none;">
            <li v-for="ascent in maxToDate.ascents" :key="ascent.id">
              <span class="b">{{ ascent.name }}</span>
              (V{{ ascent.grade }}), {{ ascent.date }}
            </li>
          </ul>
        </div>
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
    stat: Stat,
    uniqueGrades: Array,
  },
  data() {
    return {
      selectedDay: undefined,
      showOptions: false,
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
        onClick: (evt, arr) => {
          if (arr.length != 0) {
            let date = arr[0]._chart.data.datasets[0].data[arr[0]._index].x;
            this.selectedDay = date;
          } else {
            this.selectedDay = undefined;
          }
        },
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
    ascentTitle() {
      return `Day Ascents (${this.selectedAscents.length})`;
    },
    maxAscentTitle() {
      return `Ascents at V${this.maxToDate.grade} (${this.maxToDate.ascents.length})`;
    },
    selectedAscents() {
      let ret = [];
      if (this.selectedDay) {
        ret = this.stat.get("date").get(this.toStatDateString(this.selectedDay))
          .values;
      }
      return ret;
    },
    maxToDate() {
      // Sort ascents with earliest ascent first
      if (this.selectedDay) {
        let filteredAscents = [...this.stat.values].filter(
          (ascent) => ascent.date <= this.toStatDateString(this.selectedDay)
        );
        let maxGrade = 0;
        let maxAscents = [];
        for (let ascent of filteredAscents) {
          let numericalGrade = this.mapGrade(ascent.grade);
          if (numericalGrade > maxGrade) {
            maxGrade = numericalGrade;
            maxAscents = [ascent];
          } else if (maxGrade == numericalGrade) {
            maxAscents.push(ascent);
          }
        }
        return { grade: "" + maxGrade, ascents: maxAscents };
      }
      return { grade: "-", ascents: [] };
    },
    atMaxAscents() {
      let ret = [];
      if (this.selectedDay) {
        console.log(ret);
      }
      return ret;
    },
    chartData() {
      let ts = this.generateTimeSeries([...this.stat.values], {
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
    toStatDateString(d) {
      return (
        d.getFullYear() +
        "-" +
        ("0" + (d.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + d.getDate()).slice(-2)
      );
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
.settings-h {
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: large;
}
</style>
