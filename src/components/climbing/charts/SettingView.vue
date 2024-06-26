<template>
  <div>
    <div>Settings</div>
    <div>
      <table class="basic-table">
        <tr>
          <td class="b">Base Stat</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select
              v-model="chart.statBase"
              @change="changeBaseStat()"
              class="setting-select"
            >
              <!-- eslint-enable vue/no-mutating-props -->
              <option
                v-for="cname in Object.keys(stats.subStats)"
                :value="cname"
                :key="cname.id"
              >
                {{ prettyCapitalize(cname) }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="b">"Split By" Stat</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select
              v-model="chart.opts.splitStat"
              @change="changeSplitStat()"
              class="setting-select"
            >
              <!-- eslint-enable vue/no-mutating-props -->
              <option :value="null">
                {{
                  chart.opts.splitStat === null ? "Select a split stat" : "none"
                }}
              </option>
              <option
                v-for="cname in allowedSplitStats"
                :value="cname"
                :key="cname.id"
              >
                {{ prettyCapitalize(cname) }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="!chart.opts.splitStat">
          <td class="b">Type</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select
              v-model="chart.type"
              @change="changeChartType()"
              class="setting-select"
            >
              <!-- eslint-enable vue/no-mutating-props -->
              <option value="pie">Pie</option>
              <option value="bar">Bar</option>
            </select>
          </td>
        </tr>
        <tr v-else>
          <td class="b">Split Limit</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select
              v-model="chart.opts.splitLimit"
              @change="$emit('changeSplitLimit', chart.opts.splitLimit)"
              class="setting-select"
            >
              <!-- eslint-enable vue/no-mutating-props -->
              <option v-for="v in splitLimitOpts" :value="v" :key="v">
                {{ v }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="b">Sort order</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select
              v-model="chart.opts.sortByName"
              @change="changeSortOrder()"
              class="setting-select"
            >
              <!-- eslint-enable vue/no-mutating-props -->
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
                >
                  {{ aggregators[aKey] }}
                </option>
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
                >
                  {{ prettyCapitalize(aOpt) }}
                </option>
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
                >
                  {{ vName }}
                </option>
              </select>
            </div>
          </td>
        </tr>
        <tr>
          <td class="b">Limit</td>
          <td align="center">
            <div
              class="flex-row-nw setting-select bg1"
              style="padding: 3px 8px 3px 8px"
            >
              <span class="flex-gs" style="flex-basis: 10px">
                <!-- eslint-disable vue/no-mutating-props -->
                <input
                  v-model.number="chart.opts.limit"
                  type="number"
                  style="width: 100%"
                />
                <!-- eslint-enable vue/no-mutating-props -->
              </span>
              &nbsp;
              <span>
                <i
                  class="fas fa-check icn filter-txt"
                  v-tooltip="'Apply Limit'"
                  @click="changeLimit()"
                ></i>
                &nbsp;
                <i
                  class="fas fa-trash icn filter-txt"
                  v-tooltip="'Remove Limit'"
                  @click="changeLimit(0)"
                ></i>
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
import Aggregate from "@/mixins/Aggregate.js";
import Utils from "@/mixins/Utils.js";
export default {
  mixins: [Utils],
  props: {
    chart: Object,
    stats: Stat,
  },
  data() {
    return {
      // Aggregator Variables
      aggregator: null,
      catToAggregate: null,
      valToAggregate: null,
      splitLimitOpts: [1, 2, 3, 4],
    };
  },
  computed: {
    aggregateOpts() {
      return Aggregate.compatibility[this.aggregator];
    },
    needsSubValue() {
      return Aggregate.needsSubValue[this.aggregator];
    },
    aggregators() {
      return Aggregate.names;
    },
    allowedSplitStats() {
      return [
        "area",
        "dayOfWeek",
        "grade",
        "month",
        "flags",
        "rating",
        "year",
      ].filter((s) => s != this.chart.statBase);
    },
  },
  methods: {
    // EMIT actions
    changeChartType() {
      this.$emit("changeChartType", this.chart.type);
    },
    changeSortOrder() {
      this.$emit("changeSortOrder", this.chart.opts.sortByName);
    },
    changeLimit(limit) {
      this.$emit("changeLimit", limit != null ? limit : this.chart.opts.limit);
    },
    changeBaseStat() {
      this.$emit("changeBaseStat", this.chart.statBase);
    },
    changeSplitStat() {
      this.$emit("changeSplitStat", this.chart.opts.splitStat);
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
          value: this.valToAggregate,
        });
      }
    },
    // Local Methods
    emptyCatVal() {
      this.catToAggregate = null;
      this.valToAggregate = null;
    },
  },
  mounted() {
    if (this.chart.opts.aggOpts) {
      this.aggregator = this.chart.opts.aggOpts.aggregator;
      this.catToAggregate = this.chart.opts.aggOpts.catagory;
      this.valToAggregate = this.chart.opts.aggOpts.value;
    }
  },
};
</script>

<style lang="scss" scoped>
.setting-select {
  width: 90%;
}
</style>
