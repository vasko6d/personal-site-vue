<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import Stat, { type StatKey } from "@/utils/Stat";
import Aggregate, { type AggregatorName } from "@/utils/Aggregate";
import { prettyCapitalize } from "@/utils/Utils";
import type { Chart } from "../types";

const props = defineProps<{
  chart: Chart;
  stats: Stat;
}>();

const emit = defineEmits<{
  changeChartType: [type: string];
  changeSortOrder: [sortByName: boolean];
  changeLimit: [limit: number];
  changeBaseStat: [statBase: string];
  changeSplitStat: [splitStat: string | null];
  changeSplitLimit: [splitLimit: number];
  changeAggregator: [opts: { aggregator: AggregatorName | null; catagory: string | null; value: StatKey | null }];
}>();

const aggregator = ref<AggregatorName | null>(null);
const catToAggregate = ref<string | null>(null);
const valToAggregate = ref<StatKey | null>(null);
const splitLimitOpts = [1, 2, 3, 4];

const aggregateOpts = computed(() => (aggregator.value ? Aggregate.compatibility[aggregator.value] : []));
const needsSubValue = computed(() => (aggregator.value ? Aggregate.needsSubValue[aggregator.value] : false));
const aggregators = computed(() => Aggregate.names);
const allowedSplitStats = computed(() =>
  ["area", "dayOfWeek", "grade", "month", "flags", "rating", "year"].filter(
    (s) => s != props.chart.statBase,
  ),
);

function changeChartType() {
  emit("changeChartType", props.chart.type);
}
function changeSortOrder() {
  emit("changeSortOrder", !!props.chart.opts.sortByName);
}
function changeLimit(limit?: number) {
  emit("changeLimit", limit != null ? limit : (props.chart.opts.limit ?? 0));
}
function changeBaseStat() {
  emit("changeBaseStat", props.chart.statBase);
}
function changeSplitStat() {
  emit("changeSplitStat", props.chart.opts.splitStat ?? null);
}
function changeAggregator(emptyValue = false) {
  if (emptyValue) {
    valToAggregate.value = null;
  }
  if (
    aggregator.value === null ||
    (catToAggregate.value != null && (!needsSubValue.value || valToAggregate.value))
  ) {
    emit("changeAggregator", {
      aggregator: aggregator.value,
      catagory: catToAggregate.value,
      value: valToAggregate.value,
    });
  }
}
function emptyCatVal() {
  catToAggregate.value = null;
  valToAggregate.value = null;
}

onMounted(() => {
  if (props.chart.opts.aggOpts) {
    aggregator.value = props.chart.opts.aggOpts.aggregator;
    catToAggregate.value = props.chart.opts.aggOpts.catagory;
    valToAggregate.value = props.chart.opts.aggOpts.value;
  }
});
</script>

<template>
  <div>
    <div>Settings</div>
    <div>
      <table class="basic-table">
        <tr>
          <td class="b">Base Stat</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select v-model="chart.statBase" @change="changeBaseStat()" class="setting-select">
              <option v-for="cname in Object.keys(stats.subStats)" :value="cname" :key="cname">
                {{ prettyCapitalize(cname) }}
              </option>
            </select>
            <!-- eslint-enable vue/no-mutating-props -->
          </td>
        </tr>
        <tr>
          <td class="b">"Split By" Stat</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select v-model="chart.opts.splitStat" @change="changeSplitStat()" class="setting-select">
              <option :value="null">
                {{ chart.opts.splitStat == null ? "Select a split stat" : "none" }}
              </option>
              <option v-for="cname in allowedSplitStats" :value="cname" :key="cname">
                {{ prettyCapitalize(cname) }}
              </option>
            </select>
            <!-- eslint-enable vue/no-mutating-props -->
          </td>
        </tr>
        <tr v-if="!chart.opts.splitStat">
          <td class="b">Type</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select v-model="chart.type" @change="changeChartType()" class="setting-select">
              <option value="pie">Pie</option>
              <option value="bar">Bar</option>
            </select>
            <!-- eslint-enable vue/no-mutating-props -->
          </td>
        </tr>
        <tr v-else>
          <td class="b">Split Limit</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select
              v-model="chart.opts.splitLimit"
              @change="emit('changeSplitLimit', chart.opts.splitLimit ?? 2)"
              class="setting-select"
            >
              <option v-for="v in splitLimitOpts" :value="v" :key="v">
                {{ v }}
              </option>
            </select>
            <!-- eslint-enable vue/no-mutating-props -->
          </td>
        </tr>
        <tr>
          <td class="b">Sort order</td>
          <td>
            <!-- eslint-disable vue/no-mutating-props -->
            <select v-model="chart.opts.sortByName" @change="changeSortOrder()" class="setting-select">
              <option :value="true">Sort by name</option>
              <option :value="false">Sort by value</option>
            </select>
            <!-- eslint-enable vue/no-mutating-props -->
          </td>
        </tr>
        <tr>
          <td class="b">Aggregate Function</td>
          <td>
            <div>
              <select v-model="aggregator" class="setting-select" @change="(emptyCatVal(), changeAggregator())">
                <option :value="null">
                  {{ aggregator === null ? "Select function" : "none" }}
                </option>
                <option v-for="aKey in Object.keys(aggregators)" :value="aKey" :key="aKey">
                  {{ aggregators[aKey as AggregatorName] }}
                </option>
              </select>
            </div>
            <div v-show="aggregator != null">
              <select v-model="catToAggregate" @change="changeAggregator(true)" class="setting-select">
                <option :value="null">Select stat</option>
                <option v-for="aOpt in aggregateOpts" :value="aOpt" :key="aOpt">
                  {{ prettyCapitalize(aOpt) }}
                </option>
              </select>
            </div>
            <div v-show="catToAggregate != null && needsSubValue">
              <select v-model="valToAggregate" @change="changeAggregator()" class="setting-select">
                <option :value="null">Select value</option>
                <option
                  v-for="vName in Object.keys(stats.get(catToAggregate ?? '').subStats)"
                  :value="vName"
                  :key="vName"
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
            <div class="flex-row-nw setting-select bg1" style="padding: 3px 8px 3px 8px">
              <span class="flex-gs" style="flex-basis: 10px">
                <!-- eslint-disable vue/no-mutating-props -->
                <input v-model.number="chart.opts.limit" type="number" style="width: 100%" />
                <!-- eslint-enable vue/no-mutating-props -->
              </span>
              &nbsp;
              <span>
                <i class="fas fa-check icn filter-txt" v-tooltip="'Apply Limit'" @click="changeLimit()"></i>
                &nbsp;
                <i class="fas fa-trash icn filter-txt" v-tooltip="'Remove Limit'" @click="changeLimit(0)"></i>
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-select {
  width: 90%;
}
</style>
