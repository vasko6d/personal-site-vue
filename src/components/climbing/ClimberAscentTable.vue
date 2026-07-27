<script setup lang="ts">
import { ref } from 'vue'
import DataTable from '@/components/shared/DataTable.vue'
import { mapGrade } from '@/utils/Utils'
import type { ProcessedAscent } from '@/utils/Utils'

const props = defineProps<{
  values: ProcessedAscent[]
  columns: string[]
}>()

const showConfirm = ref(false)

const headings: Record<string, string> = {
  climber: 'Climber',
  date: 'Date',
  type: 'Type',
  grade: 'Grade',
  name: 'Name',
  rating: 'Stars',
  recommend: 'Recommend',
  area: 'Area',
  subArea: 'SubArea',
  flags: 'Flags',
  comment: 'Comment',
}

const sortable = [
  'climber',
  'date',
  'type',
  'grade',
  'name',
  'recommend',
  'rating',
  'area',
  'subArea',
  'flags',
  'comment',
]

const filterable = [
  'climber',
  'date',
  'type',
  'grade',
  'name',
  'rating',
  'area',
  'subArea',
  'flags',
  'comment',
]

const customSorting: Record<
  string,
  (ascending: boolean) => (a: ProcessedAscent, b: ProcessedAscent) => number
> = {
  grade: (ascending) => (a, b) => {
    const ga = mapGrade(a.grade) as number
    const gb = mapGrade(b.grade) as number
    return ascending ? ga - gb : gb - ga
  },
  comment: (ascending) => (a, b) => {
    return ascending ? a.commentLength - b.commentLength : b.commentLength - a.commentLength
  },
}

function rowClick(row: ProcessedAscent) {
  const url = `https://www.8a.nu/crags/bouldering/${row.countrySlug}/${row.cragSlug}/sectors/${row.sectorSlug}/routes/${row.zlaggableSlug}`
  console.log('Opening external 8a.nu url: ', url)
  window.open(url, '_blank')
}

function escapeCSV(value: unknown): string {
  if (value === undefined || value === null) return ''
  let str = String(value)
  // Double quotes inside the field must be doubled
  str = str.replace(/"/g, '""')
  // If the field contains a comma, newline, or double quote, wrap it in double quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str}"`
  }
  return str
}

function convertToCSV(data: ProcessedAscent[], activeColumnsOnly = true): string {
  const csvRows: string[] = []
  const headers = activeColumnsOnly ? props.columns : Object.keys(data[0] ?? {})
  csvRows.push(headers.join(','))

  for (const row of data) {
    const values = headers.map((header) => {
      let cell = (row as unknown as Record<string, unknown>)[header]
      if (Array.isArray(cell)) cell = cell.join(', ')
      return escapeCSV(cell)
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

function downloadCSV(data: ProcessedAscent[], activeColumnsOnly = true) {
  const csv = convertToCSV(data, activeColumnsOnly)

  // Get current datetime in YYYY-MM-DD_HH-mm-ss format
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours(),
  )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  const filename = `ascents_${datetime}.csv`

  console.log('Downloading CSV: ', filename)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div id="ascent-table">
    <div>
      <button @click="showConfirm = true">Export to CSV</button>
    </div>
    <div v-if="showConfirm" class="confirm-dialog">
      <div class="confirm-content">
        <p>Are you sure you want to export these [{{ values.length }}] ascents to CSV?</p>
        <!-- prettier-ignore -->
        <button
          @click="
            downloadCSV(values);
            showConfirm = false
          "
        >
          Current Columns
        </button>
        <!-- prettier-ignore -->
        <button
          @click="
            downloadCSV(values, false);
            showConfirm = false
          "
        >
          All Data
        </button>
        <button @click="showConfirm = false">Cancel</button>
      </div>
    </div>
    <div class="table-container">
      <DataTable
        :columns="columns"
        :data="values"
        :headings="headings"
        :sortable="sortable"
        :filterable="filterable"
        :customSorting="customSorting"
        :orderBy="{ column: 'date', ascending: false }"
        :perPage="100"
        :perPageValues="[10, 25, 50, 100, 500, 2000]"
        @row-click="rowClick"
      >
        <template #date="{ row }">{{ row.date.replace(/-/g, '&#8209;') }}</template>
        <template #grade="{ row }">V{{ row.grade }}</template>
        <template #flags="{ row }">{{ row.flags.join(', ') }}</template>
        <template #recommend="{ row }">
          <i v-if="row.recommend" class="fas fa-thumbs-up"></i>
        </template>
        <template #comment="{ row }">
          <div class="left" v-html="row.comment"></div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
@use '@/assets/styles/table-container';
#ascent-table {
  display: inline-block;
  max-width: 1400px;
  @media only screen and (max-width: 1400px) {
    max-width: 100%;
  }
  .left {
    text-align: left;
  }
  overflow-x: auto;
  .confirm-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    .confirm-content {
      background: #fff;
      padding: 2em;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      text-align: center;
      button {
        margin: 0 1em;
      }
    }
  }
}
</style>
