<script setup lang="ts">
// TEMPORARY Phase 4 verification scaffolding - remove this view + its route
// once Phase 6 wires these wrappers into the real ChartView.vue/
// TimeSeriesChart.vue consumers.
import BarGraph from "@/components/charts/BarGraph.vue";
import LineGraph from "@/components/charts/LineGraph.vue";
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import LoadingSpinner from "@/components/shared/LoadingSpinner.vue";
import type { ChartData, ChartOptions } from "chart.js";

const barData: ChartData<"bar"> = {
  labels: ["2020", "2021", "2022", "2023", "2024"],
  datasets: [
    { label: "Boulder", data: [12, 19, 8, 15, 22], backgroundColor: "#4c9f70", stack: "s" },
    { label: "Sport", data: [5, 8, 12, 6, 9], backgroundColor: "#9e738f", stack: "s" },
  ],
};
const barOptions: ChartOptions<"bar"> & { splitStat?: boolean } = {
  splitStat: true,
  scales: { x: { stacked: true }, y: { stacked: true } },
};

const lineData: ChartData<"line"> = {
  labels: [
    "2024-01-01",
    "2024-02-01",
    "2024-03-01",
    "2024-04-01",
    "2024-05-01",
    "2024-06-01",
  ],
  datasets: [
    {
      label: "Ascents",
      data: [2, 5, 3, 8, 6, 10],
      borderColor: "#4c9f70",
      backgroundColor: "#4c9f70",
    },
  ],
};
const lineOptions: ChartOptions<"line"> = {
  scales: {
    x: { type: "time", time: { unit: "month" } },
    y: { beginAtZero: true },
  },
  plugins: {
    zoom: {
      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
      pan: { enabled: true, mode: "x" },
    },
  },
};

const doughnutData: ChartData<"doughnut"> = {
  labels: ["V4", "V6", "V8", "V10+"],
  datasets: [
    {
      data: [8, 15, 10, 3],
      backgroundColor: ["#4c9f70", "#9e738f", "#c9a24b", "#5b7fbd"],
    },
  ],
};
</script>

<template>
  <div class="blk-container">
    <h2>Chart demo (temporary - Phase 4 verification)</h2>
    <div class="chart">
      <h3>Bar (stacked, sort-by-value plugin)</h3>
      <BarGraph :chartData="barData" :options="barOptions" />
    </div>
    <div class="chart">
      <h3>Line (time scale + zoom/pan plugin)</h3>
      <LineGraph :chartData="lineData" :options="lineOptions" />
    </div>
    <div class="chart">
      <h3>Doughnut</h3>
      <DoughnutChart :chartData="doughnutData" />
    </div>
    <div class="chart">
      <h3>Spinner (vue-simple-spinner replacement)</h3>
      <LoadingSpinner :size="48" />
    </div>
  </div>
</template>
