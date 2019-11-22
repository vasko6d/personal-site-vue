<template>
  <div id="boulder-scorecard">
    <h1>{{ climberName }}'s Ticklist</h1>
    <div class="flex-row">
      <div>
        <div class="chart bg1">
          <climber-select baseURL="/climbing/ticklist/" />
        </div>
      </div>
      <div>
        <div class="chart bg1">
          <stat-filter
            :currentFilters="currentFilters"
            :stats="stats"
            :startExpanded="false"
            @clearFilters="clearFilters"
          />
        </div>
      </div>
      <div>
        <div class="chart bg1">
          <div class="b">
            <span class="icn" @click="showColumnFlags = !showColumnFlags">
              Column Select
              <i
                :class="{
                  fas: true,
                  'fa-angle-down': !showColumnFlags,
                  'fa-angle-up': showColumnFlags
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
                  v-for="col in columns"
                  :key="col.id"
                  @click="col.active = !col.active"
                >
                  {{ options.headings[col.name] }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="table-container">
      <v-client-table
        ref="vuetable"
        :columns="activeColumns"
        :data="currentFilteredStat.values"
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
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
import Stat from "@/mixins/Stat.js";
import ClimberSelect from "@/components/climbing/ClimberSelect.vue";
import StatFilter from "@/components/climbing/StatFilter.vue";
export default {
  components: {
    ClimberSelect,
    StatFilter
  },
  mixins: [Utils],
  props: {
    sandboxId: String
  },
  data() {
    return {
      showColumnFlags: false,
      stats: new Stat("ascents", ["comment"]),
      currentFilters: {
        area: null,
        year: null,
        recommend: null,
        grade: null,
        rating: null
      },
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
        perPageValues: [10, 25, 50, 100, 500, 2000],
        sortable: [
          "date",
          "type",
          "grade",
          "name",
          "recommend",
          "rating",
          "area",
          "subArea",
          "flags",
          "comment"
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
        customSorting: {
          grade: ascending => {
            return (a, b) => {
              if (ascending) {
                return this.mapGrade(a.grade) - this.mapGrade(b.grade);
              }
              return this.mapGrade(b.grade) - this.mapGrade(a.grade);
            };
          },
          comment: ascending => {
            return (a, b) => {
              if (ascending) {
                return a.commentLength - b.commentLength;
              }
              return b.commentLength - a.commentLength;
            };
          }
        }
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
    climberName() {
      return this.kebabToCap(this.sandboxId);
    },
    currentFilteredStat() {
      return this.stats.getFiltered(false, this.currentFilters);
    }
  },
  mounted() {
    this.fetchData(this.sandboxId)
      .then(result => {
        let ascents = result.data;
        this.stats = new Stat("ascents", ["comment"]);
        this.stats.goDeeper(ascents);
        console.log("Ticklist: ", this.stats);
      })
      .catch(error => {
        window.alert(error.msg);
      });
  },
  methods: {
    clearFilters(catToClear) {
      if (catToClear) {
        this.$set(this.currentFilters, catToClear, null);
      } else {
        for (const cat of Object.keys(this.currentFilters)) {
          this.$set(this.currentFilters, cat, null);
        }
      }
    },
    rowClick(e) {
      let url = new URL(
        "https://www.8a.nu/scorecard/Search.aspx?SearchType=ASCENTS"
      );

      url.searchParams.append("CragName", e.row.area);
      url.searchParams.append("AscentName", e.row.name);
      url.searchParams.append("AscentType", 1);
      console.log("Opening external 8a.nu url: ", url.toString());
      window.open(url, "_blank");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
@import "@/assets/styles/table-container.scss";
#boulder-scorecard {
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
