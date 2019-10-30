<template>
  <div class="table-container" id="boulder-scorecard">
    <div>
      <div class="VuePagination col-opts">
        <span class="opt-header">Columns:</span>
        <div>
          <ul class="col-opt">
            <li
              :class="{ active: col.active }"
              v-for="col in firstHalf"
              :key="col.id"
              @click="col.active = !col.active"
            >
              {{ options.headings[col.name] }}
            </li>
          </ul>
          <ul class="col-opt">
            <li
              :class="{ active: col.active }"
              v-for="col in secondHalf"
              :key="col.id"
              @click="col.active = !col.active"
            >
              {{ options.headings[col.name] }}
            </li>
          </ul>
        </div>
      </div>
      <v-client-table
        ref="vuetable"
        :columns="activeColumns"
        :data="ascents"
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
      </v-client-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ascents: require("@/assets/json/8a-scorecard.json")["ascents"],
      columns: [
        { name: "date", active: true },
        { name: "type", active: false },
        { name: "grade", active: true },
        { name: "name", active: true },
        { name: "rating", active: true },
        { name: "recommend", active: false },
        { name: "area", active: true },
        { name: "subArea", active: false },
        { name: "flags", active: true },
        { name: "comment", active: false }
      ],
      options: {
        headings: {
          date: "Date",
          type: "Type",
          grade: "Grade",
          name: "Name",
          rating: "Stars",
          recommend: "Recommend",
          area: "Area",
          subArea: "SubArea",
          flags: "Flags",
          comment: "Comment"
        },
        pagination: {
          chunk: 5
        },
        sortable: [
          "date",
          "type",
          "grade",
          "name",
          "recommend",
          "rating",
          "area",
          "subArea",
          "flags"
        ],
        filterable: [
          "date",
          "type",
          "grade",
          "name",
          "rating",
          "area",
          "subArea",
          "flags",
          "comment"
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
  computed: {
    activeColumns() {
      let ret = [];
      for (let col of this.columns) {
        if (col.active) {
          ret.push(col.name);
        }
      }
      return ret;
    },
    firstHalf() {
      let ret = [];
      for (let i = 0; i < Math.floor(this.columns.length / 2); i++) {
        ret.push(this.columns[i]);
      }
      return ret;
    },
    secondHalf() {
      let ret = [];
      for (
        let i = Math.floor(this.columns.length / 2);
        i < this.columns.length;
        i++
      ) {
        ret.push(this.columns[i]);
      }
      return ret;
    }
  },
  methods: {
    rowClick(e) {
      console.log(e.row);
    }
  },
  mounted() {
    let json = require("@/assets/json/8a-scorecard.json");
    this.ascents = json["ascents"];
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
  @media only screen and (max-width: 1400px) {
    max-width: 100%;
  }
  overflow-x: auto;
  .col-opts {
    display: flex;
    justify-content: center;
    .opt-header {
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-weight: bold;
    }
    .col-opt {
      display: flex;
      li {
        flex-grow: 1;
        flex-shrink: 1;
      }
    }
  }
}
</style>
