<template>
  <div>
    <div>Ascents</div>
    <select v-model="subCatagory" class="setting-select">
      <option :value="null">Select {{ chart.statBase }}</option>
      <option value="All">~ALL~</option>
      <option v-for="cat in ascentChoices" :key="cat.id" :value="cat.name">{{
        cat.label + " (" + cat.datum + ")"
      }}</option>
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
</template>

<script>
import Stat from "@/mixins/Stat.js";
import Utils from "@/mixins/Utils.js";
export default {
  mixins: [Utils],
  props: {
    chart: Object,
    stats: Stat,
  },
  data() {
    return {
      // Ascent Variables
      subCatagory: null,
    };
  },
  computed: {
    catStats() {
      return this.stats.get(this.chart.statBase);
    },
    ascentChoices() {
      let choices = [];
      for (let i = 0; i < this.chart.chartData.labels.length; i++) {
        let datum = 0;
        for (let dataset of this.chart.chartData.datasets) {
          datum += dataset.data[i];
        }
        choices.push({
          name: this.chart.chartData.names[i],
          label: this.chart.chartData.labels[i],
          datum: datum,
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
  },
};
</script>

<style lang="scss" scoped></style>
