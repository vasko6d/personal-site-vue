<script setup lang="ts">
import DataTable from '@/components/shared/DataTable.vue'
import ClimberAvatar from './ClimberAvatar.vue'
import type { LeaderboardEntry } from '@/utils/Cookies'

defineProps<{
  entries: LeaderboardEntry[]
}>()

const columns = ['climber', 'total', 'sendCount']
const headings: Record<string, string> = {
  climber: 'Climber',
  total: 'Cookies',
  sendCount: 'Sends',
}
const sortable = ['climber', 'total', 'sendCount']
</script>

<template>
  <div class="table-container">
    <DataTable
      :columns="columns"
      :data="entries"
      :headings="headings"
      :sortable="sortable"
      :orderBy="{ column: 'total', ascending: false }"
      :perPage="25"
    >
      <template #climber="{ row }">
        <div class="climber-cell">
          <ClimberAvatar :name="row.climber" :size="28" />
          {{ row.climber }}
        </div>
      </template>
      <template #total="{ row }">{{ row.total.toFixed(1) }}</template>
    </DataTable>
  </div>
</template>

<style scoped>
.climber-cell {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
</style>
