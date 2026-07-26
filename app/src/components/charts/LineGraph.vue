<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
// registers Chart.js's date adapter, needed for TimeScale (used by TimeSeriesChart)
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin,
);

defineProps<{
  chartData: ChartData<"line">;
  options?: ChartOptions<"line">;
}>();
</script>

<template>
  <div class="chart-canvas-wrapper">
    <Line :data="chartData" :options="options ?? {}" />
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
