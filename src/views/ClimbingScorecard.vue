<template>
  <div class="table-container" id="boulder-scorecard">
    <div>
      <v-client-table
        ref="vuetable"
        :columns="columns"
        :data="ascents"
        :options="options"
        class="pagi"
      ></v-client-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ascents: require("@/assets/json/8a-scorecard.json")["ascents"],
      columns: [
        "date",
        "type",
        "name",
        "rating",
        "area",
        "subArea",
        "flags",
        "comment"
      ],
      options: {
        headings: {
          date: "Date",
          type: "Type",
          name: "Name",
          rating: "Stars",
          area: "Area",
          subArea: "Sub-Area",
          flags: "Flags",
          comment: "Comment"
        },
        sortable: [
          "date",
          "type",
          "name",
          "rating",
          "area",
          "subArea",
          "flags"
        ],
        filterable: [
          "date",
          "type",
          "name",
          "rating",
          "area",
          "subArea",
          "flags"
        ],
        sortIcon: {
          base: "fas",
          is: "",
          up: "fa-caret-up",
          down: "fa-caret-down"
        },
        orderBy: { column: "date", ascending: false },
        customSorting: {}
      }
    };
  },
  methods: {
    onPaginationData(paginationData) {
      this.$refs.pagination.setPaginationData(paginationData);
    },
    onChangePage(page) {
      this.$refs.vuetable.changePage(page);
    }
  },
  mounted() {
    let json = require("@/assets/json/8a-scorecard.json");
    this.ascents = json["ascents"];
    console.log(json);
    console.log("mounted");
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/light-theme.scss";
}
@import "@/assets/styles/table-container.scss";
#boulder-scorecard {
  display: inline-block;
  max-width: 1400px;
}
</style>
