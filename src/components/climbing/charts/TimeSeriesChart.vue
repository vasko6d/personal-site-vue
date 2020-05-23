<template>
  <div class="chart-ts bg1" v-if="showChart">
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
          <i class="fas icn fa-chart-line" @click="viewType = 'run'"></i>
        </span>
        <span class="middle"></span>
        <i
          class="fas fa-window-close icn"
          @click="$emit('close')"
          v-tooltip="'Discard Chart'"
        ></i>
      </div>
    </div>
    <h2>Time Series</h2>
    <line-graph :chartData="chartData" :options="options" />
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
    stats: Stat,
  },
  data() {
    return {
      viewType: "run",
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
                unit: "day",
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
      seriesOpts: [
        {
          color: "#6d826c",
          borderWidth: 2,
          label: "Filled",
        },
      ],
    };
  },
  computed: {
    showChart() {
      return true;
    },
    chartData() {
      let ascents = [...this.stats.values];
      let ts = this.generateTimeSeries(ascents, 10);
      let data = [];
      if (ts) {
        data = ts.day.map((el) => {
          return { x: el.x, y: el.yr.sinceMax };
        });
      }

      // Return it in ChartJS format
      return {
        datasets: [
          {
            data: data,
            backgroundColor: "#6d826c",
            borderColor: "#6d826c",
            borderWidth: 2,
            label: "Days Since Max",
            fill: false,
            pointRadius: 2,
            pointBackgroundColor: "#6d826c",
            pointBorderColor: "#6d826c",
          },
        ],
      };
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
.setting-select {
  width: 90%;
}
</style>
