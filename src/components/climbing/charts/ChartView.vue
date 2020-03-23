<template>
  <div>
    <div v-if="chart.subtitle">{{ chart.subtitle }}</div>
    <div v-if="chart.opts.aggregateFxn != null">
      {{ chart.opts.aggregateTitle }}
    </div>
    <div v-if="chart.type === 'pie'">
      <doughnut-chart :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
    <div v-else-if="chart.type === 'grade' || chart.type === 'bar'">
      <bar-graph :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
  </div>
</template>

<script>
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import BarGraph from "@/components/charts/BarGraph.vue";
export default {
  name: "ChartView",
  components: {
    DoughnutChart,
    BarGraph,
  },
  props: {
    chart: Object,
  },
  data() {
    return {
      viewType: "chart",
    };
  },
};
</script>

<style lang="scss" scoped></style>
