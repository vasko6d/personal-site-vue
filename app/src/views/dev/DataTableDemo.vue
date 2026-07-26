<script setup lang="ts">
// TEMPORARY Phase 3 verification scaffolding - remove this view + its route
// once Phase 6 wires DataTable into the real ClimberAscentTable.vue consumer.
import DataTable from "@/components/shared/DataTable.vue";

interface MockRow {
  name: string;
  grade: number;
  area: string;
  recommend: boolean;
}

const rows: MockRow[] = [
  { name: "Midnight Lightning", grade: 8, area: "Camp 4", recommend: true },
  { name: "The Mandala", grade: 12, area: "Buttermilks", recommend: true },
  { name: "Ambrosia", grade: 11, area: "Buttermilks", recommend: false },
  { name: "Slashface", grade: 8, area: "Camp 4", recommend: true },
  { name: "Evilution", grade: 12, area: "RPC", recommend: false },
  { name: "Footprints", grade: 4, area: "Buttermilks", recommend: true },
  { name: "Too Big to Flail", grade: 10, area: "RPC", recommend: false },
  { name: "The Swarm", grade: 10, area: "Camp 4", recommend: true },
  { name: "Thunder Bird", grade: 4, area: "RPC", recommend: false },
  { name: "The Fly", grade: 9, area: "Buttermilks", recommend: true },
  { name: "Iron Man Traverse", grade: 3, area: "Camp 4", recommend: false },
  { name: "Xenolith", grade: 5, area: "RPC", recommend: true },
];
</script>

<template>
  <div class="blk-container">
    <h2>DataTable demo (temporary - Phase 3 verification)</h2>
    <div class="table-container">
      <DataTable
        :columns="['name', 'grade', 'area', 'recommend']"
        :data="rows"
        :headings="{ name: 'Name', grade: 'Grade', area: 'Area', recommend: 'Recommend' }"
        :sortable="['name', 'grade', 'area']"
        :filterable="['name', 'area']"
        :order-by="{ column: 'grade', ascending: false }"
        :per-page="5"
        :per-page-values="[5, 10, 25]"
        @row-click="(row) => console.log('row click', row)"
      >
        <template #grade="{ row }">V{{ row.grade }}</template>
        <template #recommend="{ row }">
          <i v-if="row.recommend" class="fas fa-thumbs-up"></i>
        </template>
      </DataTable>
    </div>
  </div>
</template>
