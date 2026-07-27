<script setup lang="ts">
import { computed } from 'vue'
import ClimberAvatar from './ClimberAvatar.vue'
import { monthRange } from '@/utils/Cookies'
import type { MonthlyWinner } from '@/utils/Cookies'
import { mapName } from '@/utils/Utils'

const props = defineProps<{
  winners: MonthlyWinner[]
}>()

const winnerMap = computed(() => {
  const map = new Map<string, MonthlyWinner>()
  for (const winner of props.winners) map.set(winner.yearMonth, winner)
  return map
})

// monthRange fills in every month between the first and last winner - months
// with zero sends across all climbers render as an empty tile below rather
// than being skipped.
const months = computed(() => monthRange(props.winners))

const years = computed(() => {
  const byYear = new Map<string, string[]>()
  for (const yearMonth of months.value) {
    const year = yearMonth.split('-')[0]!
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(yearMonth)
  }
  return [...byYear.entries()]
})

function monthLabel(yearMonth: string): string {
  const monthNum = yearMonth.split('-')[1]!
  return mapName('month', monthNum) ?? monthNum
}
</script>

<template>
  <div class="cookie-calendar">
    <div v-for="[year, yearMonths] in years" :key="year" class="calendar-year bg1">
      <div class="year-label b">{{ year }}</div>
      <div class="year-grid">
        <div
          v-for="yearMonth in yearMonths"
          :key="yearMonth"
          class="month-tile"
          :class="{ empty: !winnerMap.get(yearMonth) }"
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
    .year-label {
      font-size: 1.2em;
      margin-bottom: 0.5em;
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
