<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from "vue";

export interface OrderBy {
  column: string;
  ascending: boolean;
}

const {
  columns,
  data,
  headings = {},
  sortable = [],
  filterable = [],
  customSorting = {},
  orderBy,
  perPage: perPageDefault = 10,
  perPageValues,
} = defineProps<{
  columns: string[];
  data: T[];
  headings?: Record<string, string>;
  sortable?: string[];
  filterable?: string[];
  customSorting?: Record<string, (ascending: boolean) => (a: T, b: T) => number>;
  orderBy?: OrderBy;
  perPage?: number;
  perPageValues?: number[];
}>();

const emit = defineEmits<{
  "row-click": [row: T];
}>();

const filterText = ref("");
const sortColumn = ref(orderBy?.column ?? "");
const sortAscending = ref(orderBy?.ascending ?? true);
const currentPage = ref(1);
const perPage = ref(perPageDefault);

function heading(column: string): string {
  return headings[column] ?? column.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function isSortable(column: string): boolean {
  return sortable.includes(column);
}

// row objects come from callers as plain typed interfaces with no index
// signature, so a cast is needed to read an arbitrary column key off them
function cellValue(row: T, column: string): unknown {
  return (row as Record<string, unknown>)[column];
}

function sortBy(column: string) {
  if (!isSortable(column)) return;
  if (sortColumn.value === column) {
    sortAscending.value = !sortAscending.value;
  } else {
    sortColumn.value = column;
    sortAscending.value = true;
  }
}

function defaultComparator(column: string) {
  return (a: T, b: T) => {
    const av = cellValue(a, column);
    const bv = cellValue(b, column);
    if (typeof av === "number" && typeof bv === "number") {
      return av - bv;
    }
    return String(av ?? "").localeCompare(String(bv ?? ""));
  };
}

const filteredData = computed(() => {
  const text = filterText.value.trim().toLowerCase();
  if (!text || filterable.length === 0) return data;
  return data.filter((row) =>
    filterable.some((col) => String(cellValue(row, col) ?? "").toLowerCase().includes(text)),
  );
});

const sortedData = computed(() => {
  if (!sortColumn.value) return filteredData.value;
  const column = sortColumn.value;
  const ascending = sortAscending.value;
  const customFactory = customSorting[column];
  const comparator = customFactory
    ? customFactory(ascending)
    : (a: T, b: T) => {
        const cmp = defaultComparator(column)(a, b);
        return ascending ? cmp : -cmp;
      };
  return [...filteredData.value].sort(comparator);
});

const pageCount = computed(() => Math.max(1, Math.ceil(sortedData.value.length / perPage.value)));

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return sortedData.value.slice(start, start + perPage.value);
});

// shows a sliding window of page numbers around the current page, mirroring
// vue-tables-2's "pagination.chunk" behavior
const pageWindow = computed(() => {
  const chunk = 5;
  const half = Math.floor(chunk / 2);
  let start = Math.max(1, currentPage.value - half);
  const end = Math.min(pageCount.value, start + chunk - 1);
  start = Math.max(1, end - chunk + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
});

watch([filterText, perPage], () => {
  currentPage.value = 1;
});

watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count;
});

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(1, page), pageCount.value);
}
</script>

<template>
  <div class="data-table">
    <div v-if="filterable.length || perPageValues?.length" class="data-table-toolbar">
      <input v-if="filterable.length" v-model="filterText" type="text" placeholder="Filter..." />
      <label v-if="perPageValues?.length">
        Per page:
        <select v-model.number="perPage">
          <option v-for="n in perPageValues" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
    </div>
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column" @click="sortBy(column)">
            {{ heading(column) }}
            <i
              v-if="sortColumn === column"
              class="fas VueTables__sort-icon"
              :class="sortAscending ? 'fa-caret-up' : 'fa-caret-down'"
            ></i>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in pagedData" :key="i" @click="emit('row-click', row)">
          <td v-for="column in columns" :key="column">
            <slot :name="column" :row="row" :value="cellValue(row, column)">{{
              cellValue(row, column)
            }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="pageCount > 1" class="VuePagination">
      <ul>
        <li><a href="#" @click.prevent="goToPage(currentPage - 1)">&laquo;</a></li>
        <li v-for="p in pageWindow" :key="p" :class="{ active: p === currentPage }">
          <a href="#" @click.prevent="goToPage(p)">{{ p }}</a>
        </li>
        <li><a href="#" @click.prevent="goToPage(currentPage + 1)">&raquo;</a></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.data-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
}
</style>
