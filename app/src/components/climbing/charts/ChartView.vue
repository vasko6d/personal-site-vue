<script setup lang="ts">
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import BarGraph from "@/components/charts/BarGraph.vue";
import type { Chart } from "../types";

defineProps<{
  chart: Chart;
}>();
</script>

<template>
  <div>
    <div v-if="chart.subtitle">{{ chart.subtitle }}</div>
    <div v-if="chart.opts.aggregateFxn != null">
      {{ chart.opts.aggregateTitle }}
    </div>
    <div v-if="chart.type === 'pie'">
      <DoughnutChart :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
    <div v-else-if="chart.type === 'grade' || chart.type === 'bar'">
      <BarGraph :chartData="chart.chartData" :options="chart.chartOpts" />
    </div>
  </div>
</template>
