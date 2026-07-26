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
  <Doughnut :data="chartData" :options="options ?? {}" />
</template>
