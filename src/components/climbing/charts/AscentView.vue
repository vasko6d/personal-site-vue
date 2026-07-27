<script setup lang="ts">
import { computed, ref } from 'vue'
import Stat from '@/utils/Stat'
import type { Chart } from '../types'

const props = defineProps<{
  chart: Chart
  stats: Stat
}>()

const subCatagory = ref<string | null>(null)

const catStats = computed(() => props.stats.get(props.chart.statBase))

interface AscentChoice {
  name: string
  label: string
  datum: number
}

const ascentChoices = computed(() => {
  const choices: AscentChoice[] = []
  const chartData = props.chart.chartData
  for (let i = 0; i < chartData.labels.length; i++) {
    let datum = 0
    for (const dataset of chartData.datasets) {
      datum += dataset.data[i] ?? 0
    }
    choices.push({
      name: String(chartData.names[i]),
      label: chartData.labels[i]!,
      datum: datum,
    })
  }
  return choices
})

const ascents = computed(() => {
  let a: Record<string, unknown>[] = []
  if (subCatagory.value != null) {
    if (subCatagory.value === 'All') {
      a = catStats.value.values
    } else {
      a = catStats.value.get(subCatagory.value).values
    }
  }
  return a as { name: string; grade: string; date: string }[]
})
</script>

<template>
  <div>
    <div>Ascents</div>
    <select v-model="subCatagory" class="setting-select">
      <option :value="null">Select {{ chart.statBase }}</option>
      <option value="All">~ALL~</option>
      <option v-for="cat in ascentChoices" :key="cat.name" :value="cat.name">
        {{ cat.label + ' (' + cat.datum + ')' }}
      </option>
    </select>
    <div style="margin-left: 5%" v-if="subCatagory != null">
      <ul style="text-align: left">
        <li v-for="(ascent, index) in ascents" :key="index">
          <span class="b">{{ ascent.name }}</span>
          (V{{ ascent.grade }}), {{ ascent.date }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
