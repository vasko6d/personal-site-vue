<template>
  <div class="chart bg1" v-if="showChart">
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
          >|
        </span>
        <span v-if="chart.type != 'grade'">
          <i
            class="fas fa-cogs icn"
            :class="{
              'icn-a': viewType === 'settings',
            }"
            @click="viewType = 'settings'"
            v-tooltip="'Settings'"
          ></i
          >|
        </span>
        <span>
          <i
            class="fas icn"
            :class="{
              'fa-chart-line': chart.type === 'line',
              'fa-chart-pie': chart.type === 'pie',
              'fa-chart-bar': chart.type === 'bar' || chart.type === 'grade',
              'icn-a': viewType === 'chart',
            }"
            @click="viewType = 'chart'"
            v-tooltip="'Show Chart'"
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
    <h2>{{ chart.title }}</h2>
    <chart-view v-if="viewType === 'chart'" :chart="chart" />
    <setting-view
      v-else-if="viewType === 'settings'"
      :chart="chart"
      :stats="stats"
      @changeChartType="$emit('changeChartType', $event), chartView()"
      @changeAggregator="$emit('changeAggregator', $event), chartView()"
      @changeBaseStat="$emit('changeBaseStat', $event), chartView()"
      @changeSplitStat="$emit('changeSplitStat', $event), chartView()"
      @changeSortOrder="$emit('changeSortOrder', $event), chartView()"
      @changeLimit="$emit('changeLimit', $event), chartView()"
    />
    <ascent-view
      v-else-if="viewType === 'ascents'"
      :chart="chart"
      :stats="stats"
    />
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
import Utils from "@/mixins/Utils.js";
import ChartView from "./ChartView.vue";
import SettingView from "./SettingView.vue";
import AscentView from "./AscentView.vue";
export default {
  mixins: [Utils],
  components: {
    ChartView,
    SettingView,
    AscentView,
  },
  props: {
    chart: Object,
    stats: Stat,
  },
  data() {
    return {
      // chart, settings, ascents
      viewType: "chart",
    };
  },
  computed: {
    showChart() {
      return !(
        (this.chart.opts &&
          this.chart.opts.filters &&
          this.chart.opts.filters[this.chart.statBase] &&
          this.chart.opts.filters[this.chart.statBase].val) ||
        this.chart.opts.hideChart
      );
    },
  },
  methods: {
    chartView() {
      this.viewType = "chart";
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
.setting-select {
  width: 90%;
}
</style>
