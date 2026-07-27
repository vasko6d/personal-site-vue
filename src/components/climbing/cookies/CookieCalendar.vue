<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ClimberAvatar from './ClimberAvatar.vue'
import type { MonthlyWinner } from '@/utils/Cookies'
import { mapName } from '@/utils/Utils'

const props = defineProps<{
  winners: MonthlyWinner[]
  defaultYear?: string
  activeYearMonth?: string
}>()

const emit = defineEmits<{
  'month-click': [yearMonth: string]
}>()

const winnerMap = computed(() => {
  const map = new Map<string, MonthlyWinner>()
  for (const winner of props.winners) map.set(winner.yearMonth, winner)
  return map
})

const availableYears = computed(() =>
  [...new Set(props.winners.map((w) => w.yearMonth.slice(0, 4)))].sort(),
)

function pickDefaultYear(): string | undefined {
  if (props.defaultYear && availableYears.value.includes(props.defaultYear)) {
    return props.defaultYear
  }
  const currentYear = String(new Date().getFullYear())
  if (availableYears.value.includes(currentYear)) return currentYear
  return availableYears.value[availableYears.value.length - 1]
}

const selectedYear = ref(pickDefaultYear())

// winners loads asynchronously (the store fetches every scorecard first), so
// availableYears starts empty - re-derive the default once real data (or a
// new defaultYear from route navigation) arrives instead of getting stuck.
watch([availableYears, () => props.defaultYear], () => {
  selectedYear.value = pickDefaultYear()
})

const monthsOfYear = computed(() => {
  if (!selectedYear.value) return []
  const year = selectedYear.value
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)
})

function monthLabel(yearMonth: string): string {
  const monthNum = yearMonth.split('-')[1]!
  return mapName('month', monthNum) ?? monthNum
}
</script>

<template>
  <div class="cookie-calendar">
    <div class="calendar-year bg1">
      <div class="year-select-row">
        <select v-if="availableYears.length" v-model="selectedYear" class="year-select b">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        <span v-else class="year-label b">No sends yet</span>
      </div>
      <div class="year-grid">
        <div
          v-for="yearMonth in monthsOfYear"
          :key="yearMonth"
          class="month-tile"
          :class="{ empty: !winnerMap.get(yearMonth), active: yearMonth === activeYearMonth }"
          @click="winnerMap.get(yearMonth) && emit('month-click', yearMonth)"
        >
          <div class="month-name">{{ monthLabel(yearMonth) }}</div>
          <template v-if="winnerMap.get(yearMonth)">
            <ClimberAvatar :name="winnerMap.get(yearMonth)!.climber" :size="32" />
            <div class="winner-name">{{ winnerMap.get(yearMonth)!.climber }}</div>
            <div class="winner-points">{{ winnerMap.get(yearMonth)!.points }} pts</div>
          </template>
          <div v-else class="no-winner">&mdash;</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cookie-calendar {
  display: flex;
  flex-direction: column;
  gap: 1em;
  .calendar-year {
    padding: 1em;
    .year-select-row {
      margin-bottom: 0.5em;
    }
    .year-select {
      font-size: 1.2em;
    }
    .year-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5em;
    }
    .month-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5em;
      border-radius: 0.5em;
      background: rgba(128, 128, 128, 0.15);
      &.empty {
        opacity: 0.4;
      }
      &:not(.empty) {
        cursor: pointer;
      }
      &.active {
        outline: 2px solid currentColor;
      }
      .month-name {
        font-size: 0.8em;
        text-transform: uppercase;
        margin-bottom: 0.25em;
      }
      .winner-name {
        font-size: 0.85em;
        margin-top: 0.25em;
        text-align: center;
      }
      .winner-points {
        font-size: 0.75em;
        opacity: 0.8;
      }
      .no-winner {
        font-size: 1.2em;
        opacity: 0.5;
      }
    }
  }
}
</style>
