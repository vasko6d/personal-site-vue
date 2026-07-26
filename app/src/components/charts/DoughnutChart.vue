<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

defineProps<{
  chartData: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
}>();
</script>

<template>
  <div class="chart-canvas-wrapper">
    <Doughnut :data="chartData" :options="options ?? {}" />
  </div>
</template>

<style scoped>
/* see BarGraph.vue for why this wrapper exists */
.chart-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
