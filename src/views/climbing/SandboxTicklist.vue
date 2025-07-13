<template>
  <div id="boulder-scorecard">
    <h1>The Sandbox's Ticklist</h1>
    <div v-if="loading">
      <spinner size="huge" :line-size="24"></spinner>
      <div>{{ loadingMessage }}</div>
    </div>
    <div v-else class="flex-row">
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
      <climber-column-select
        :columns="columns"
        :labelMap="headings"
        @toggleActive="
          columns[$event.index].active = !columns[$event.index].active
        "
      >
      </climber-column-select>
    </div>
    <div v-show="!loading">
      <climber-ascent-table
        :columns="activeColumns"
        :values="currentFilteredStat.values"
      ></climber-ascent-table>
    </div>
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
import Stat from "@/mixins/Stat.js";
import ClimberSelect from "@/components/climbing/ClimberSelect.vue";
import ClimberAscentTable from "@/components/climbing/ClimberAscentTable.vue";
import ClimberColumnSelect from "@/components/climbing/ClimberColumnSelect.vue";
import StatFilter from "@/components/climbing/StatFilter.vue";
import Timer from "@/mixins/webgl/Timer.js";
import Spinner from "vue-simple-spinner";
export default {
  components: {
    StatFilter,
    Spinner,
    ClimberAscentTable,
    ClimberColumnSelect,
  },
  mixins: [Utils],
  data() {
    return {
      loading: true,
      loadingMessage: "Fetching Scorecards...",
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
        subArea: { val: null, show: true },
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
  methods: {
    fetchAllData() {
      setTimeout(() => {
        var promises = [];
        let timer = new Timer(true);
        const climberData = ClimberSelect.data().importedClimbers;
        let fetchCount = 0;
        climberData.forEach((climber) => {
          promises.push(
            this.fetchData(climber.sandboxId).then((result) => {
              const ascents = result.ascents.map((ascent) =>
                this.preprocessAscent(ascent, climber.name)
              );
              fetchCount++;
              this.loadingMessage = `Fetching Scorecards ( ${fetchCount} / ${climberData.length} )...`;
              return Promise.resolve(ascents);
            })
          );
        });
        Promise.all(promises).then((allAscents) => {
          this.loadingMessage = "Processing Scorecards...";
          setTimeout(() => {
            let allAscentsFlat = [].concat.apply([], allAscents);
            this.stats.goDeeper(allAscentsFlat);
            console.log(`[${timer.getTimeSec()}] All Ascents porcessed`);
            console.log("Ticklist: ", this.stats);
            this.loading = false;
          }, 100);
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
