<template>
  <div id="boulder-scorecard">
    <h1>The Sandbox's Ticklist</h1>
    <spinner
      v-show="loading"
      size="huge"
      message="Fetching Sandbox Scorecards..."
      :line-size="24"
    ></spinner>
    <div v-show="!loading" class="flex-row">
      <!--div class="chart-w">
        <div class="chart-p bg1">
          <climber-select baseURL="/climbing/ticklist/" />
        </div>
      </div-->
      <div class="chart-w">
        <div class="chart-p bg1">
          <stat-filter
            :currentFilters="currentFilters"
            :stats="stats"
            :startExpanded="false"
            @clearFilters="clearFilters"
          />
        </div>
      </div>
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
    <div v-show="!loading" class="table-container">
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
import Timer from "@/mixins/webgl/Timer.js";
import Spinner from "vue-simple-spinner";
export default {
  components: {
    StatFilter,
    Spinner,
  },
  mixins: [Utils],
  data() {
    return {
      loading: true,
      showColumnFlags: false,
      stats: new Stat("ascents", ["comment"]),
      currentFilters: {
        climber: { val: null, show: true },
        area: { val: null, show: true },
        year: { val: null, show: true },
        month: { val: null, show: true },
        dayOfWeek: { val: null, show: false },
        recommend: { val: null, show: false },
        grade: { val: null, show: true },
        rating: { val: null, show: false },
        softness: { val: null, show: true },
        flags: { val: null, show: false },
        type: { val: null, show: true },
        country: { val: null, show: false },
        // state: { val: null, show: false },
      },
      columns: [
        { name: "climber", active: true },
        { name: "date", active: true },
        { name: "type", active: false },
        { name: "grade", active: true },
        { name: "name", active: true },
        { name: "rating", active: true },
        { name: "recommend", active: false },
        { name: "area", active: true },
        { name: "subArea", active: false },
        { name: "flags", active: true },
        { name: "comment", active: false },
      ],
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
    },
  },
  created() {
    this.loading = true;
    this.fetchAllData();
  },
  updated() {
    this.loading = false;
  },
  methods: {
    fetchAllData() {
      setTimeout(() => {
        var promises = [];
        let timer = new Timer(true);
        ClimberSelect.data().importedClimbers.forEach((climber) => {
          promises.push(
            this.fetchData(climber.sandboxId).then((result) => {
              const ascents = result.ascents.map((ascent) =>
                this.preprocessAscent(ascent, climber.name)
              );
              return Promise.resolve(ascents);
            })
          );
        });
        Promise.all(promises)
          .then((allAscents) => {
            let allAscentsFlat = [].concat.apply([], allAscents);
            this.stats.goDeeper(allAscentsFlat);
            return Promise.resolve();
          })
          .then(() => {
            console.log(`[${timer.getTimeSec()}] All Ascents porcessed`);
            console.log("Ticklist: ", this.stats);
          });
      }, 250);
    },
    clearFilters(catToClear) {
      if (catToClear) {
        this.$set(this.currentFilters, catToClear, {
          val: null,
          show: this.currentFilters[catToClear].show,
        });
      } else {
        for (const cat of Object.keys(this.currentFilters)) {
          this.$set(this.currentFilters, cat, {
            val: null,
            show: this.currentFilters[cat].show,
          });
        }
      }
    },
    rowClick(e) {
      const url = `https://www.8a.nu/crags/bouldering/${e.row.countrySlug}/${e.row.cragSlug}/sectors/${e.row.sectorSlug}/routes/${e.row.zlaggableSlug}`;
      console.log("Opening external 8a.nu url: ", url);
      window.open(url, "_blank");
    },
  },
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
