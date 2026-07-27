<script setup lang="ts">
import { computed } from 'vue'
import ModalDialog from '@/components/shared/ModalDialog.vue'
import DataTable from '@/components/shared/DataTable.vue'
import ClimberAvatar from './ClimberAvatar.vue'
import { climberSendHistory, isSendActive } from '@/utils/Cookies'
import type { CookieSend } from '@/utils/Cookies'
import { mapGrade } from '@/utils/Utils'

const props = defineProps<{
  climber: string
  allSends: CookieSend[]
  currentLevel: number | undefined
  asOf: Date
  yearMonth?: string
}>()

defineEmits<{
  close: []
}>()

interface CookieRow {
  cookiesEarned: number
  date: string
  name: string
  grade: string
  area: string
  levelAtTime: number
}

// Only sends actually contributing to the score currently shown: in the
// live view that's currently-active (non-expired) sends, matching the
// leaderboard total; in a month-filtered view it's sends dated in that
// specific month, matching that view's undecayed monthly total.
const rows = computed<CookieRow[]>(() => {
  let history = climberSendHistory(props.allSends, props.climber).filter(
    (send) => send.cookiesEarned > 0,
  )
  history = props.yearMonth
    ? history.filter((send) => send.date.startsWith(props.yearMonth!))
    : history.filter((send) => isSendActive(send, props.asOf))
  return history.map((send) => ({
    cookiesEarned: send.cookiesEarned,
    date: send.date,
    name: send.ascent.name,
    grade: send.ascent.grade,
    area: send.ascent.area,
    levelAtTime: send.levelAtTime,
  }))
})

const columns = ['cookiesEarned', 'date', 'name', 'grade', 'area', 'levelAtTime']
const headings: Record<string, string> = {
  cookiesEarned: 'Cookies',
  date: 'Date',
  name: 'Climb',
  grade: 'Grade',
  area: 'Area',
  levelAtTime: 'Level',
}
const sortable = columns
const customSorting: Record<string, (ascending: boolean) => (a: CookieRow, b: CookieRow) => number> = {
  grade: (ascending) => (a, b) => {
    const ga = mapGrade(a.grade) as number
    const gb = mapGrade(b.grade) as number
    return ascending ? ga - gb : gb - ga
  },
}
</script>

<template>
  <ModalDialog size="wide" @close="$emit('close')">
    <template #header>
      <div class="detail-header">
        <ClimberAvatar :name="climber" :size="48" />
        <div>
          <h2>{{ climber }}</h2>
          <div v-if="currentLevel !== undefined" class="current-level">
            Current Level: V{{ currentLevel }}
          </div>
        </div>
        <i class="fas fa-window-close icn" @click="$emit('close')"></i>
      </div>
    </template>
    <div class="table-container">
      <DataTable
        :columns="columns"
        :data="rows"
        :headings="headings"
        :sortable="sortable"
        :customSorting="customSorting"
        :orderBy="{ column: 'date', ascending: false }"
        :perPage="25"
      >
        <template #grade="{ row }">V{{ row.grade }}</template>
      </DataTable>
    </div>
  </ModalDialog>
</template>

<style lang="scss" scoped>
.detail-header {
  display: flex;
  align-items: center;
  gap: 0.75em;
  h2 {
    margin: 0;
  }
  .current-level {
    font-size: 0.9em;
  }
  .icn {
    margin-left: auto;
    cursor: pointer;
  }
}
</style>
