<template>
  <div>
    <div v-if="loadingMessage">
      <spinner size="huge" :line-size="24"></spinner>
      <div>{{ loadingMessage }}</div>
    </div>
    <div v-else class="table-container">
      <h1>Choose a Crossword to Begin</h1>
      <div class="blk-container">
        <v-client-table
          :columns="columns"
          :data="xwordHeaders"
          :options="options"
          @row-click="rowClick"
        >
          <div slot="createDate" slot-scope="props">
            {{ toDateString(props.row.createDate) }}
          </div>
          <div slot="status" slot-scope="props">
            {{ getStatus(props.row.id) }}
          </div>
        </v-client-table>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "vue-simple-spinner";
export default {
  components: {
    Spinner,
  },
  name: "XwordSearch",
  data() {
    return {
      loadingMessage: "Fetching Crosswords...",
      columns: [
        "title",
        "author",
        "difficulty",
        "dimension",
        "createDate",
        "status",
      ],
      xwordHeaders: [],
      options: {
        headings: {
          name: "Title",
          code: "Author",
          difficulty: "Difficulty",
          dimension: "Size",
          createDate: "Date",
          status: "Status",
        },
        sortable: [
          "title",
          "author",
          "difficulty",
          "dimension",
          "createDate",
          "status",
        ],
        filterable: ["title", "author", "difficulty", "dimension", "status"],
        sortIcon: {
          base: "fas",
          is: "",
          up: "fa-caret-up",
          down: "fa-caret-down",
        },
        orderBy: { column: "createDate", ascending: false },

        customSorting: {
          status: (ascending) => {
            return (a, b) => {
              const sa = this.getStatus(a.id);
              const sb = this.getStatus(b.id);
              if (ascending) {
                return this.statusMap[sa] > this.statusMap[sb] ? 1 : -1;
              }
              return this.statusMap[sa] <= this.statusMap[sb] ? 1 : -1;
            };
          },
          dimension: (ascending) => {
            return (a, b) => {
              const da = a.dimension.split("x").map(function (d) {
                return parseInt(d);
              });
              const db = b.dimension.split("x").map(function (d) {
                return parseInt(d);
              });
              if (ascending) {
                return da[0] > db[0] ? 1 : -1;
              }
              return da[0] <= db[0] ? 1 : -1;
            };
          },
        },
      },
      statusMap: {
        Completed: 2,
        Started: 1,
        "Not Started": 0,
      },
    };
  },
  created() {
    this.fetchXwordHeaders();
  },
  methods: {
    fetchXwordHeaders() {
      fetch(`/json/xwords/headers.json`)
        .then((response) => {
          response.json().then((json) => {
            setTimeout(() => {
              this.xwordHeaders = json.headers;
              console.log("Xword Headres: ", json);
              this.loadingMessage = undefined;
            }, 100);
          });
        })
        .catch((e) => console.error(e));
    },
    toDateString(yyyymmdd) {
      return new Date(
        parseInt(yyyymmdd.substring(0, 4)),
        parseInt(yyyymmdd.substring(4, 6)) - 1,
        parseInt(yyyymmdd.substring(6, 8))
      ).toDateString();
    },
    getStatus(id) {
      const lsKey = "xword:" + id;
      if (localStorage[lsKey]) {
        let xword = JSON.parse(localStorage[lsKey]);
        if (xword.completed) {
          return "Completed";
        }
        return "Started";
      }
      return "Not Started";
    },
    statusSort(a, b) {
      const sa = this.getStatus(a.id);
      const sb = this.getStatus(b.id);
      return this.statusMap[sa] - this.statusMap[sb];
    },
    rowClick(e) {
      this.$router.push("" + e.row.id);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
@import "@/assets/styles/table-container.scss";
</style>
