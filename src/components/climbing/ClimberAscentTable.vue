<template>
  <div id="ascent-table">
    <v-client-table
      ref="vuetable"
      :columns="columns"
      :data="values"
      :options="options"
      @row-click="rowClick"
    >
      <div slot="date" slot-scope="props">
        {{ props.row.date.replace(/-/g, "&#8209;") }}
      </div>
      <div slot="grade" slot-scope="props">V{{ props.row.grade }}</div>
      <div slot="flags" slot-scope="props">
        {{ props.row.flags.join(", ") }}
      </div>
      <div slot="recommend" slot-scope="props">
        <i v-if="props.row.recommend" class="fas fa-thumbs-up"></i>
      </div>
      <div slot="comment" slot-scope="props">
        <div class="left" v-html="props.row.comment"></div>
      </div>
    </v-client-table>
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
export default {
  props: {
    values: Array,
    columns: Array,
  },
  mixins: [Utils],
  data() {
    return {
      options: {
        headings: {
          climber: "Climber",
          date: "Date",
          type: "Type",
          grade: "Grade",
          name: "Name",
          rating: "Stars",
          recommend: "Recommend",
          area: "Area",
          subArea: "SubArea",
          flags: "Flags",
          comment: "Comment",
        },
        pagination: {
          chunk: 5,
        },
        perPage: 100,
        perPageValues: [10, 25, 50, 100, 500, 2000],
        sortable: [
          "climber",
          "date",
          "type",
          "grade",
          "name",
          "recommend",
          "rating",
          "area",
          "subArea",
          "flags",
          "comment",
        ],
        filterable: [
          "climber",
          "date",
          "type",
          "grade",
          "name",
          "rating",
          "area",
          "subArea",
          "flags",
          "comment",
        ],
        sortIcon: {
          base: "fas",
          is: "",
          up: "fa-caret-up",
          down: "fa-caret-down",
        },
        orderBy: { column: "date", ascending: false },
        customSorting: {
          grade: (ascending) => {
            return (a, b) => {
              if (ascending) {
                return this.mapGrade(a.grade) - this.mapGrade(b.grade);
              }
              return this.mapGrade(b.grade) - this.mapGrade(a.grade);
            };
          },
          comment: (ascending) => {
            return (a, b) => {
              if (ascending) {
                return a.commentLength - b.commentLength;
              }
              return b.commentLength - a.commentLength;
            };
          },
        },
      },
    };
  },
  methods: {
    rowClick(e) {
      const url = `https://www.8a.nu/crags/bouldering/${e.row.countrySlug}/${e.row.cragSlug}/sectors/${e.row.sectorSlug}/routes/${e.row.zlaggableSlug}`;
      console.log("Opening external 8a.nu url: ", url);
      window.open(url, "_blank");
    },
  },
};
</script>
<style lang="scss">
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
}
</style>
