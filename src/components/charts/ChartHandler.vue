<template>
  <div class="chart bg1">
    <h2>{{ chart.title }}</h2>
    <div v-if="chart.subtitle">{{ chart.subtitle }}</div>
    <div v-if="chart.type === 'pie'">
      <doughnut-chart :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
    <div v-else-if="chart.type === 'grade'">
      <bar-graph :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
  </div>
</template>

<script>
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import BarGraph from "@/components/charts/BarGraph.vue";
export default {
  components: {
    DoughnutChart,
    BarGraph
  },
  props: {
    chart: Object
  }
};
</script>

<style lang="scss" scoped></style>
