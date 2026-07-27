<script setup lang="ts">
import { computed } from 'vue'
import ModalDialog from '@/components/shared/ModalDialog.vue'
import DataTable from '@/components/shared/DataTable.vue'
import ClimberAvatar from './ClimberAvatar.vue'
import { climberSendHistory } from '@/utils/Cookies'
import type { CookieSend, ClimberCurrentLevel } from '@/utils/Cookies'

const props = defineProps<{
  climber: string
  allSends: CookieSend[]
  currentLevel: ClimberCurrentLevel | undefined
}>()

defineEmits<{
  close: []
}>()

interface CookieRow {
  cookiesEarned: number
  date: string
  name: string
  area: string
  levelAtTime: number
}

// Only sends that actually earned cookies - "all their climbs that have
// cookie contributed", not their full lifetime ticklist.
const rows = computed<CookieRow[]>(() =>
  climberSendHistory(props.allSends, props.climber)
    .filter((send) => send.cookiesEarned > 0)
    .map((send) => ({
      cookiesEarned: send.cookiesEarned,
      date: send.date,
      name: send.ascent.name,
      area: send.ascent.area,
      levelAtTime: send.levelAtTime,
    })),
)

const columns = ['cookiesEarned', 'date', 'name', 'area', 'levelAtTime']
const headings: Record<string, string> = {
  cookiesEarned: 'Cookie Value',
  date: 'Date',
  name: 'Climb Name',
  area: 'Area',
  levelAtTime: 'Climber Level (at time of send)',
}
const sortable = columns
</script>

<template>
  <ModalDialog @close="$emit('close')">
    <template #header>
      <div class="detail-header">
        <ClimberAvatar :name="climber" :size="48" />
        <div>
          <h2>{{ climber }}</h2>
          <div v-if="currentLevel" class="current-level">
            Current Level: V{{ currentLevel.rounded }}
            <span class="raw-level">({{ currentLevel.raw.toFixed(2) }} unrounded)</span>
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
        :orderBy="{ column: 'date', ascending: false }"
        :perPage="25"
      />
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
    .raw-level {
      opacity: 0.75;
    }
  }
  .icn {
    margin-left: auto;
    cursor: pointer;
  }
}
</style>
