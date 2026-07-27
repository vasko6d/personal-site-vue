<script setup lang="ts">
import { ref } from 'vue'
import type { ColumnDef } from './types'

defineProps<{
  columns: ColumnDef[]
  labelMap: Record<string, string>
}>()

const emit = defineEmits<{
  toggleActive: [payload: { index: number; column: ColumnDef }]
}>()

const showColumnFlags = ref(false)
</script>

<template>
  <div class="chart-w">
    <div class="chart-p bg1">
      <div class="b">
        <span class="icn" @click="showColumnFlags = !showColumnFlags">
          Column Select
          <i
            :class="{
              fas: true,
              'fa-angle-down': !showColumnFlags,
              'fa-angle-up': showColumnFlags,
            }"
          ></i>
        </span>
      </div>
      <div v-show="showColumnFlags" class="VuePagination col-opts">
        <div>
          <ul class="flex-row">
            <li
              :class="{ active: col.active }"
              class="col-btn"
              v-for="(col, index) in columns"
              :key="col.name"
              @click="emit('toggleActive', { index, column: col })"
            >
              {{ labelMap[col.name] }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
