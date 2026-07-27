<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Stat from '@/utils/Stat'
import { mapGrade, mapName, prettyCapitalize } from '@/utils/Utils'
import type { StatFilterMap } from './types'

const props = withDefaults(
  defineProps<{
    currentFilters: StatFilterMap
    stats: Stat
    startExpanded?: boolean
  }>(),
  {
    startExpanded: true,
  },
)

const emit = defineEmits<{
  clearFilters: [category?: string]
}>()

const showFilters = ref(true)
const addingFilter = ref(false)
const filterToAdd = ref<string | null>(null)

const currentFilteredStat = computed(() => props.stats.getFiltered(undefined, props.currentFilters))

const addableFilters = computed(() => {
  const ret: string[] = []
  for (const cat of Object.keys(props.currentFilters)) {
    if (!props.currentFilters[cat]!.show) {
      ret.push(cat)
    }
  }
  return ret
})

interface FilterOption {
  raw: string
  label: string
}

const filterOpts = computed(() => {
  const ret: Record<string, FilterOption[]> = {}
  for (const cat of Object.keys(props.currentFilters)) {
    const limitOpts = props.currentFilters[cat]!.val != null
    const s = limitOpts ? props.stats : currentFilteredStat.value
    const choices: FilterOption[] = []
    const rawNames = Object.keys(s.get(cat).subStats)
    if (cat === 'grade') {
      rawNames.sort((a, b) => (mapGrade(a) as number) - (mapGrade(b) as number))
    } else {
      rawNames.sort()
    }
    for (const rawName of rawNames) {
      choices.push({
        raw: rawName,
        label: truncateString(mapName(cat, rawName) ?? rawName, 15),
      })
    }
    ret[cat] = choices
  }
  return ret
})

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

function addFilter() {
  if (filterToAdd.value != null) {
    props.currentFilters[filterToAdd.value]!.show = true
  }
}

function deleteFitler(catToDelete: string) {
  props.currentFilters[catToDelete]!.show = false
  props.currentFilters[catToDelete]!.val = null
}

onMounted(() => {
  showFilters.value = props.startExpanded
})
</script>

<template>
  <div class="stat-filter">
    <div class="b">
      <span class="icn" @click="showFilters = !showFilters">
        Filters
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showFilters,
            'fa-angle-up': showFilters,
          }"
        ></i> </span
      >&nbsp;
      <i
        v-show="showFilters"
        class="fas fa-eraser icn"
        @click="emit('clearFilters')"
        v-tooltip="'Clear All Filters'"
      ></i
      >&nbsp;
      <i
        v-show="showFilters"
        :class="{
          fas: true,
          icn: true,
          'fa-plus': !addingFilter,
        }"
        @click="addingFilter = !addingFilter"
        v-tooltip="'Add Filter'"
      ></i>
    </div>
    <div
      class="b bg1"
      style="margin-top: 0.5em; padding-top: 0.25em"
      v-show="addingFilter && showFilters"
    >
      <div class="flex-row">
        <span class="fstatic"></span>
        <span class="fgrow">Choose Filter to add</span>
        <span class="fstatic topx">
          <i
            class="fas fa-window-close icn"
            @click="((addingFilter = !addingFilter), (filterToAdd = null))"
            v-tooltip="'Close'"
          ></i>
        </span>
      </div>
      <div>
        <select v-model="filterToAdd" @change="addFilter()">
          <option :value="null">Select Filter</option>
          <option v-for="fil in addableFilters" :key="fil" :value="fil">
            {{ prettyCapitalize(fil) }}
          </option>
        </select>
      </div>
    </div>
    <div v-show="showFilters">
      <div
        v-for="catagory in Object.keys(currentFilters)"
        :key="catagory"
        v-show="currentFilters[catagory]!.show"
      >
        <div class="flex-row">
          <span class="filter-txt">{{ prettyCapitalize(catagory) }} =</span>
          <select class="flex-gs" v-model="currentFilters[catagory]!.val">
            <option :value="null">All</option>
            <option v-for="opt in filterOpts[catagory]" :key="opt.raw" :value="opt.raw">
              {{ opt.label }}
            </option>
          </select>
          <i class="fas fa-eraser icn filter-txt" @click="emit('clearFilters', catagory)"></i>
          <i class="fas fa-trash icn filter-txt" @click="deleteFitler(catagory)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-txt {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.flex-row {
  .fstatic {
    flex-basis: 20px;
  }
  .fgrow {
    flex-grow: 1;
  }
  margin-right: 0.5em;
  margin-left: 0.5em;
}
.topx {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
