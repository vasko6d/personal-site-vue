<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { SortStackedBarByValue } from "@/charts/plugins/SortStackedBarByValuePlugin";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  SortStackedBarByValue,
);

defineProps<{
  chartData: ChartData<"bar">;
  options?: ChartOptions<"bar">;
}>();
</script>

<template>
  <div class="chart-canvas-wrapper">
    <Bar :data="chartData" :options="options ?? {}" />
  </div>
</template>

<style scoped>
/*
 * vue-chartjs renders <canvas> as the component's own root element (no
 * wrapping div), so a sizing class/style a consumer puts directly on
 * <BarGraph> would land on the canvas itself. Chart.js needs a
 * position:relative parent with a real height to size responsively against
 * - this wrapper is that parent. Consumers size *this* wrapper (it receives
 * fallthrough class/style as the new component root) and the canvas fills it.
 */
.chart-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
