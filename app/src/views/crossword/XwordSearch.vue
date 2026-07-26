<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import DataTable from "@/components/shared/DataTable.vue";
import LoadingSpinner from "@/components/shared/LoadingSpinner.vue";

interface XwordHeader {
  id: string;
  title: string;
  author: string;
  difficulty: string;
  dimension: string;
  createDate: string;
  [key: string]: unknown;
}

const router = useRouter();

const loadingMessage = ref<string | undefined>("Fetching Crosswords...");
const columns = ["title", "author", "difficulty", "dimension", "createDate", "status"];
const xwordHeaders = ref<XwordHeader[]>([]);

const headings: Record<string, string> = {
  name: "Title",
  code: "Author",
  difficulty: "Difficulty",
  dimension: "Size",
  createDate: "Date",
  status: "Status",
};

const sortable = ["title", "author", "difficulty", "dimension", "createDate", "status"];
const filterable = ["title", "author", "difficulty", "dimension", "status"];

const statusMap: Record<string, number> = {
  Completed: 2,
  Started: 1,
  "Not Started": 0,
};

function getStatus(id: string): string {
  const lsKey = "xword:" + id;
  if (localStorage[lsKey]) {
    const xword = JSON.parse(localStorage[lsKey]);
    if (xword.completed) {
      return "Completed";
    }
    return "Started";
  }
  return "Not Started";
}

const customSorting: Record<string, (ascending: boolean) => (a: XwordHeader, b: XwordHeader) => number> = {
  status: (ascending) => (a, b) => {
    const sa = getStatus(a.id);
    const sb = getStatus(b.id);
    if (ascending) {
      return statusMap[sa]! > statusMap[sb]! ? 1 : -1;
    }
    return statusMap[sa]! <= statusMap[sb]! ? 1 : -1;
  },
  dimension: (ascending) => (a, b) => {
    const da = a.dimension.split("x").map((d) => parseInt(d));
    const db = b.dimension.split("x").map((d) => parseInt(d));
    if (ascending) {
      return da[0]! > db[0]! ? 1 : -1;
    }
    return da[0]! <= db[0]! ? 1 : -1;
  },
};

function toDateString(yyyymmdd: string): string {
  return new Date(
    parseInt(yyyymmdd.substring(0, 4)),
    parseInt(yyyymmdd.substring(4, 6)) - 1,
    parseInt(yyyymmdd.substring(6, 8)),
  ).toDateString();
}

function rowClick(row: XwordHeader) {
  router.push("" + row.id);
}

function fetchXwordHeaders() {
  fetch(`/json/xwords/headers.json`)
    .then((response) => {
      response.json().then((json: { headers: XwordHeader[] }) => {
        setTimeout(() => {
          xwordHeaders.value = json.headers;
          console.log("Xword Headres: ", json);
          loadingMessage.value = undefined;
        }, 100);
      });
    })
    .catch((e) => console.error(e));
}

fetchXwordHeaders();
</script>

<template>
  <div>
    <div v-if="loadingMessage">
      <LoadingSpinner :size="64" />
      <div>{{ loadingMessage }}</div>
    </div>
    <div v-else class="table-container">
      <h1>Choose a Crossword to Begin</h1>
      <div class="blk-container">
        <DataTable
          :columns="columns"
          :data="xwordHeaders"
          :headings="headings"
          :sortable="sortable"
          :filterable="filterable"
          :customSorting="customSorting"
          :orderBy="{ column: 'createDate', ascending: false }"
          @row-click="rowClick"
        >
          <template #createDate="{ row }">{{ toDateString(row.createDate) }}</template>
          <template #status="{ row }">{{ getStatus(row.id) }}</template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
@import "@/assets/styles/table-container.scss";
</style>
