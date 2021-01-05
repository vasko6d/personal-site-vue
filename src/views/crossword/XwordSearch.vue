<template>
  <div class="table-container">
    <h1>Choose a Crossword to Begin</h1>
    <div class="blk-container">
      <v-client-table
        :columns="columns"
        :data="data"
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
</template>

<script>
// Xword Data Source Imports
import Xword1 from "@/assets/xword/Xword1.vue";
import Xword2 from "@/assets/xword/Xword2.vue";
import Xword3 from "@/assets/xword/Xword3.vue";
import Xword4 from "@/assets/xword/Xword4.vue";
import Xword5 from "@/assets/xword/Xword5.vue";
import Xword6 from "@/assets/xword/Xword6.vue";
import Xword7 from "@/assets/xword/Xword7.vue";

export default {
  name: "XwordSearch",
  data() {
    return {
      columns: [
        "title",
        "author",
        "difficulty",
        "dimension",
        "createDate",
        "status",
      ],
      data: [
        Xword1.data().xword,
        Xword2.data().xword,
        Xword3.data().xword,
        Xword4.data().xword,
        Xword5.data().xword,
        Xword6.data().xword,
        Xword7.data().xword,
      ],
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
  methods: {
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
