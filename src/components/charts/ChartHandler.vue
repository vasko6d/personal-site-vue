<template>
  <div class="chart bg1" v-if="showChart">
    <div>
      <div class="chart-header">
        <span>
          <i
            class="fas fa-mountain icn"
            :class="{
              'icn-a': viewType === 'ascents'
            }"
            @click="viewType = 'ascents'"
            v-tooltip="'Show Ascents'"
          ></i
          >&nbsp;|&nbsp;
        </span>
        <span v-if="chartType != 'grade'">
          <i
            class="fas fa-cogs icn"
            :class="{
              'icn-a': viewType === 'settings'
            }"
            @click="viewType = 'settings'"
            v-tooltip="'Settings'"
          ></i
          >&nbsp;|&nbsp;
        </span>
        <span>
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
    <div v-if="viewType === 'chart'">
      <div v-if="chart.subtitle">{{ chart.subtitle }}</div>
      <div v-if="chart.opts.aggregateFxn != null">
        {{ chart.opts.aggregateTitle }}
      </div>
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
            <td class="b">Base Stat</td>
            <td>
              <select
                v-model="chart.statBase"
                @change="changeBaseStat()"
                class="setting-select"
              >
                <option
                  v-for="cname in Object.keys(stats.subStats)"
                  :value="cname"
                  :key="cname.id"
                  >{{ cname }}</option
                >
              </select>
            </td>
          </tr>
          <tr>
            <td class="b">Type</td>
            <td>
              <select
                v-model="chartType"
                @change="changeChartType()"
                class="setting-select"
              >
                <option value="pie">Pie</option>
                <option value="bar">Bar</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="b">Sort order</td>
            <td>
              <select
                v-model="chart.opts.sortByName"
                @change="changeSortOrder()"
                class="setting-select"
              >
                <option :value="true">Sort by name</option>
                <option :value="false">Sort by value</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="b">Aggregate Function</td>
            <td>
              <div>
                <select
                  v-model="aggregator"
                  class="setting-select"
                  @change="emptyCatVal(), changeAggregator()"
                >
                  <option :value="null">
                    {{ aggregator === null ? "Select function" : "none" }}
                  </option>
                  <option
                    v-for="aKey in Object.keys(aggregators)"
                    :value="aKey"
                    :key="aKey.id"
                    >{{ aggregators[aKey] }}</option
                  >
                  <!--option value="softness">Softness</option-->
                </select>
              </div>
              <div v-show="aggregator != null">
                <select
                  v-model="catToAggregate"
                  @change="changeAggregator(true)"
                  class="setting-select"
                >
                  <option :value="null">Select stat</option>
                  <option
                    v-for="aOpt in aggregateOpts"
                    :value="aOpt"
                    :key="aOpt.id"
                    >{{ aOpt }}</option
                  >
                </select>
              </div>
              <div v-show="catToAggregate != null && needsSubValue">
                <select
                  v-model="valToAggregate"
                  @change="changeAggregator()"
                  class="setting-select"
                >
                  <option :value="null">Select value</option>
                  <option
                    v-for="vName in Object.keys(
                      stats.get(catToAggregate).subStats
                    )"
                    :value="vName"
                    :key="vName.id"
                    >{{ vName }}</option
                  >
                </select>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-else-if="viewType === 'ascents'">
      <div>Ascents</div>
      <select v-model="subCatagory" class="setting-select">
        <option :value="null">Select {{ chart.statBase }}</option>
        <option value="All">~ALL~</option>
        <option v-for="cat in ascentChoics" :key="cat.id" :value="cat.name">
          {{ cat.name + " (" + cat.value + ")" }}
        </option>
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
import Aggregate from "@/mixins/Aggregate.js";
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
      // Ascent Variables
      subCatagory: null,
      // Aggregator Variables
      aggregator: null,
      catToAggregate: null,
      valToAggregate: null
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
    ascentChoics() {
      let choices = [];
      for (let i = 0; i < this.chart.chartData.labels.length; i++) {
        choices.push({
          name: this.chart.chartData.labels[i],
          value: this.chart.chartData.datasets[0].data[i]
        });
      }
      return choices;
    },
    ascents() {
      let a = [];
      if (this.subCatagory != null) {
        if (this.subCatagory === "All") {
          a = this.catStats.values;
        } else {
          a = this.catStats.get(this.subCatagory).values;
        }
      }
      return a;
    },
    aggregateOpts() {
      return Aggregate.compatibility[this.aggregator];
    },
    needsSubValue() {
      return Aggregate.needsSubValue[this.aggregator];
    },
    aggregators() {
      return Aggregate.names;
    }
  },
  methods: {
    changeChartType() {
      this.$emit("changeChartType", this.chartType);
      this.viewType = "chart";
    },
    changeSortOrder() {
      this.$emit("changeSortOrder", this.chart.opts.sortByName);
      this.viewType = "chart";
    },
    emptyCatVal() {
      this.catToAggregate = null;
      this.valToAggregate = null;
    },
    changeBaseStat() {
      this.$emit("changeBaseStat", this.chart.statBase);
      this.viewType = "chart";
    },
    changeAggregator(emptyValue = false) {
      //console.log(this.aggregator, this.catToAggregate, this.valToAggregate);
      if (emptyValue) {
        this.valToAggregate = null;
      }
      if (
        this.aggregator === null ||
        (this.catToAggregate != null &&
          (!this.needsSubValue || this.valToAggregate))
      ) {
        this.$emit("changeAggregator", {
          aggregator: this.aggregator,
          catagory: this.catToAggregate,
          value: this.valToAggregate
        });
        this.viewType = "chart";
      }
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
.setting-select {
  font-size: 16px;
  width: 90%;
}
</style>
