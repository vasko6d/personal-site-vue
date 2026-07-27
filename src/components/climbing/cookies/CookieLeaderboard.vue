<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DataTable from '@/components/shared/DataTable.vue'
import ClimberAvatar from './ClimberAvatar.vue'
import type { LeaderboardEntry } from '@/utils/Cookies'

const props = defineProps<{
  entries: LeaderboardEntry[]
}>()

const emit = defineEmits<{
  'climber-click': [climber: string]
}>()

const showAll = ref(false)

// Reset back to the top-10 view whenever the underlying entries change (e.g.
// switching between the live leaderboard and a month-filtered one) so a
// stale "already loaded all" state doesn't carry over.
watch(
  () => props.entries,
  () => {
    showAll.value = false
  },
)

const visibleEntries = computed(() => (showAll.value ? props.entries : props.entries.slice(0, 10)))

const columns = ['climber', 'total', 'sendCount']
const headings: Record<string, string> = {
  climber: 'Climber',
  total: 'Cookies',
  sendCount: 'Active Sends',
}
const sortable = ['climber', 'total', 'sendCount']
</script>

<template>
  <div class="table-container">
    <DataTable
      :columns="columns"
      :data="visibleEntries"
      :headings="headings"
      :sortable="sortable"
      :orderBy="{ column: 'total', ascending: false }"
      :perPage="25"
      @row-click="(row) => emit('climber-click', row.climber)"
    >
      <template #climber="{ row }">
        <div class="climber-cell">
          <ClimberAvatar :name="row.climber" :size="28" />
          {{ row.climber }}
        </div>
      </template>
      <template #total="{ row }">{{ row.total.toFixed(1) }}</template>
    </DataTable>
    <button v-if="!showAll && entries.length > 10" class="load-more" @click="showAll = true">
      Load {{ entries.length - 10 }} more
    </button>
  </div>
</template>

<style scoped>
.climber-cell {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.load-more {
  margin-top: 0.5em;
}
</style>
