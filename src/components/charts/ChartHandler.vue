<template>
  <div class="chart bg1" v-if="showChart">
    <div>
      <div class="chart-header">
        <i
          class="fas fa-mountain icn"
          :class="{
            'icn-a': viewType === 'ascents'
          }"
          @click="viewType = 'ascents'"
          v-tooltip="'Show Ascents'"
        ></i
        >&nbsp;|&nbsp;
        <i
          class="fas fa-cogs icn"
          :class="{
            'icn-a': viewType === 'settings'
          }"
          @click="viewType = 'settings'"
          v-tooltip="'Settings'"
        ></i
        >&nbsp;|&nbsp;
        <i
          class="fas icn"
          :class="{
            'fa-chart-line': chartType === 'line',
            'fa-chart-pie': chartType === 'pie',
            'fa-chart-bar': chartType === 'bar' || chartType === 'grade',
            'icn-a': viewType === 'chart'
          }"
          @click="viewType = 'chart'"
          v-tooltip="'Show Chart'"
        ></i>
        <span class="middle"></span>
        <i
          class="fas fa-window-close icn"
          @click="$emit('close')"
          v-tooltip="'Discard Chart'"
        ></i>
      </div>
    </div>
    <h2>{{ chart.title }}</h2>
    <div v-if="viewType === 'chart'">
      <div v-if="chart.subtitle">{{ chart.subtitle }}</div>
      <div v-if="chart.type === 'pie'">
        <doughnut-chart
          :chartData="chart.chartData"
          :options="chart.chartOpts"
        />
      </div>
      <div v-else-if="chart.type === 'grade' || chart.type === 'bar'">
        <bar-graph :chartData="chart.chartData" :options="chart.chartOpts" />
      </div>
    </div>
    <div v-else-if="viewType === 'settings'">
      <div>Settings</div>
      <div class="flex-row">
        <table class="basic-table">
          <tr>
            <td class="b">Title</td>
            <td>{{ chart.opts.title }}</td>
          </tr>
          <tr v-if="chartType != 'grade'">
            <td class="b">Type</td>
            <td>
              <select
                v-model="chartType"
                @change="changeChartType()"
                style="font-size: 16px;"
              >
                <option value="pie">Pie</option>
                <option value="bar">Bar</option>
              </select>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-else-if="viewType === 'ascents'">
      <div>Ascents</div>
      <select v-model="subCatagory" style="font-size: 16px;">
        <option :value="null">Select {{ chart.statBase }}</option>
        <option
          v-for="cat in catStats.subStats"
          :key="cat.id"
          :value="cat.name"
          >{{ cat.name }}</option
        >
      </select>
      <div style="margin-left: 5%;" v-if="subCatagory != null">
        <ul style="text-align: left;">
          <li v-for="ascent in ascents" :key="ascent.id">
            <span class="b">{{ ascent.name }}</span>
            (V{{ ascent.grade }}), {{ ascent.date }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import BarGraph from "@/components/charts/BarGraph.vue";
export default {
  components: {
    DoughnutChart,
    BarGraph
  },
  props: {
    chart: Object,
    stats: Stat
  },
  data() {
    return {
      // chart, settings, ascents
      viewType: "chart",
      chartType: null,
      subCatagory: null
    };
  },
  computed: {
    showChart() {
      return !(
        (this.chart.opts &&
          this.chart.opts.filters &&
          this.chart.opts.filters[this.chart.statBase]) ||
        this.chart.opts.hideChart
      );
    },
    catStats() {
      return this.stats.get(this.chart.statBase);
    },
    ascents() {
      let a = [];
      if (this.subCatagory != null) {
        a = this.catStats.get(this.subCatagory).values;
      }
      return a;
    }
  },
  methods: {
    changeChartType() {
      this.$emit("changeChartType", this.chartType);
      this.viewType = "chart";
    }
  },
  mounted() {
    this.chartType = this.chart.type;
  }
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
</style>
