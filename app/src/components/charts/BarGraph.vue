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
  <Bar :data="chartData" :options="options ?? {}" />
</template>
