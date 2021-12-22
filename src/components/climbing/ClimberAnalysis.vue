<template>
  <div id="climber-analysis">
    <h1>{{ climberName }}'s Analysis</h1>
    <div v-if="loading">
      <spinner size="huge" :line-size="24"></spinner>
      <div>Analyzing...</div>
    </div>
    <div v-else>
      <div class="flex-row">
        <div class="chart bg1">
          <h2>Climber Stats</h2>
          <div class="flex-row">
            <table class="basic-table">
              <tr v-for="cStat in climberStats" :key="cStat.id">
                <td class="b">{{ cStat.name }}</td>
                <td>{{ cStat.value }}</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="chart bg1">
          <stat-filter
            :currentFilters="currentFilters"
            :stats="stats"
            @clearFilters="clearFilters"
          />
        </div>
      </div>
      <h2>Dynamic Charts</h2>
      <div class="flex-row">
        <chart-handler
          v-for="(dynamicChart, index) in computedCharts"
          :key="dynamicChart.id"
          :chart="dynamicChart"
          :stats="currentFilteredStat"
          @close="closeChart(dynamicChart)"
          @changeChartType="changeChartType($event, index)"
          @changeAggregator="changeAggregator($event, index)"
          @changeBaseStat="changeBaseStat($event, index)"
          @changeSortOrder="changeSortOrder($event, index)"
          @changeLimit="changeLimit($event, index)"
        ></chart-handler>
      </div>
      <div class="flex-row">
        <time-series-chart
          v-if="
            currentFilteredStat &&
            currentFilteredStat.values.length > 0 &&
            initialized &&
            tsIsOpen
          "
          :stat="currentFilteredStat"
          :uniqueGrades="uniqueGrades"
          @close="tsIsOpen = false"
        ></time-series-chart>
      </div>
      <h2>Ascents</h2>
      <div class="flex-row">
        <div class="chart bg1">
          <stat-filter
            :currentFilters="currentFilters"
            :stats="stats"
            :startExpanded="false"
            @clearFilters="clearFilters"
          />
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

      <div class="table-container">
        <climber-ascent-table
          :columns="activeColumns"
          :values="currentFilteredStat.values"
        ></climber-ascent-table>
      </div>
    </div>
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
import Stat from "@/mixins/Stat.js";
import Aggregate from "@/mixins/Aggregate.js";
import ChartHandler from "@/components/climbing/charts/ChartHandler.vue";
import TimeSeriesChart from "@/components/climbing/charts/TimeSeriesChart.vue";
import StatFilter from "@/components/climbing/StatFilter.vue";
import Spinner from "vue-simple-spinner";
import ClimberAscentTable from "@/components/climbing/ClimberAscentTable.vue";
import ClimberColumnSelect from "@/components/climbing/ClimberColumnSelect.vue";
export default {
  name: "ClimberAnalysis",
  components: {
    ChartHandler,
    TimeSeriesChart,
    StatFilter,
    Spinner,
    ClimberAscentTable,
    ClimberColumnSelect,
  },
  mixins: [Utils],
  props: {
    climberName: String,
    rawAscents: Array,
  },
  data() {
    return {
      ascents: [],
      charts: {
        adhoc: [],
        dynamic: [],
      },
      currentFilters: {
        area: { val: null, show: true },
        year: { val: null, show: true },
        month: { val: null, show: true },
        dayOfWeek: { val: null, show: false },
        recommend: { val: null, show: true },
        grade: { val: null, show: true },
        rating: { val: null, show: false },
        softness: { val: null, show: true },
        flags: { val: null, show: false },
        type: { val: null, show: true },
        country: { val: null, show: false },
        // state: { val: null, show: false },
      },
      stats: new Stat("ascents", ["comment"]),
      timeSeries: {},
      showClimbers: false,
      initialized: false,
      loading: true,
      tsIsOpen: true,
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
    uniqueGrades() {
      let uniqueGradeSet = new Set(
        this.currentFilteredStat.values.map((el) => this.mapGrade(el.grade, 0))
      );
      return Array.from(uniqueGradeSet);
    },
    currentFilteredStat() {
      return this.stats.getFiltered(false, this.currentFilters);
    },
    computedCharts() {
      // The dynamic part of "dynamic charts"
      let compCharts = [];
      for (let i = 0; i < this.charts.dynamic.length; i++) {
        let dChart = this.charts.dynamic[i];
        let newOpts = dChart.opts;
        newOpts["filters"] = this.currentFilters;
        compCharts.push(
          this.createChart(dChart.type, dChart.statBase, newOpts)
        );
      }
      return compCharts;
    },
    climberStats() {
      let stat = this.currentFilteredStat;
      let cStats = [{ name: "Total Ascents", value: stat.count }];
      if (this.initialized) {
        const da = this.dateAnalysis(stat);
        const a = this.ascentAnalysis(stat, 20);
        cStats.push({
          name: "Boulderer Score",
          value: this.vScale(a.grade.score),
        });
        cStats.push({ name: "Average Stars", value: a.star.avg });
        cStats.push({ name: "Recommend %", value: a.star.recommend + "%" });
        cStats.push({ name: "Softness", value: a.softness + " / 10" });
        cStats.push({
          name: "Average Comment",
          value: a.comment.avgLen + " characters",
        });
        cStats.push({ name: "Earliest", value: da.firstDate });
        cStats.push({ name: "Most Recent", value: da.mostRecent });
        cStats.push({ name: "Days climbed", value: da.count });
        cStats.push({
          name: "Grade [Max, Avg]",
          value: [this.vScale(a.grade.max), this.vScale(a.grade.avg)].join(
            ", "
          ),
        });
      }
      return cStats;
    },
  },
  methods: {
    closeChart(chart) {
      this.$set(chart.opts, "hideChart", true);
    },
    changeChartType(type, chartIndex) {
      this.$set(this.charts.dynamic[chartIndex], "type", type);
    },
    changeSortOrder(sortByName, chartIndex) {
      this.$set(this.charts.dynamic[chartIndex].opts, "sortByName", sortByName);
    },
    changeLimit(limit, chartIndex) {
      this.$set(this.charts.dynamic[chartIndex].opts, "limit", limit);
    },
    changeBaseStat(newBaseStat, chartIndex) {
      this.$set(this.charts.dynamic[chartIndex], "statBase", newBaseStat);
      this.$delete(this.charts.dynamic[chartIndex].opts, "colors");
    },
    changeAggregator(opts, chartIndex) {
      if (opts.aggregator === null) {
        this.$delete(this.charts.dynamic[chartIndex].opts, "aggregateFxn");
        this.$delete(this.charts.dynamic[chartIndex].opts, "aggregateTitle");
        this.$delete(this.charts.dynamic[chartIndex].opts, "aggOpts");
      } else {
        let agg = Aggregate.fxns[opts.aggregator](opts.catagory, opts.value);
        this.$set(this.charts.dynamic[chartIndex].opts, "aggregateFxn", agg);
        this.$set(this.charts.dynamic[chartIndex].opts, "aggOpts", opts);
        this.$set(
          this.charts.dynamic[chartIndex].opts,
          "aggregateTitle",
          Aggregate.makeTitle(opts.aggregator, opts.catagory, opts.value)
        );
      }
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
    addFilter(filter) {
      this.$set(this.currentFilters, filter.catagory, filter.value);
      this.newFilter = this.generateFilter();
    },
    generateFilter() {
      return {
        catagory: "",
        value: "", // Start with just single value
        valueList: [],
        // range, multi, value
        valueType: "",
        aggregator: false,
      };
    },
    dateAnalysis(stat) {
      let dates = Object.keys(stat.get("date").subStats);
      if (dates.length === 0) {
        return "No date data";
      }
      dates.sort();
      return {
        firstDate: dates[0],
        mostRecent: dates[dates.length - 1],
        count: dates.length,
      };
    },
    ascentAnalysis(stat, ntop = 10) {
      let ascents = stat.values;
      let a = {
        grade: {
          max: 0,
          min: 0,
          avg: 0,
          score: 0,
        },
        star: {
          avg: 0,
          recommend: 0,
        },
        comment: {
          avgLen: 0,
        },
        softness: 0,
      };
      if (ascents.length === 0) {
        return a;
      }
      ascents.sort((a, b) => {
        return this.mapGrade(b.grade) - this.mapGrade(a.grade);
      });
      a.grade.max = ascents[0].grade;
      a.grade.min = Math.max(ascents[ascents.length - 1].grade, 0);
      // Average and Boulder Rating
      let sum = 0;
      let starSum = 0;
      let topCount = 0;
      let topTotal = 0;
      let numRecommend = 0;
      let totalCommentLen = 0;
      let hard = 0;
      let soft = 0;
      for (const ascent of ascents) {
        sum += this.mapGrade(ascent.grade, 0);
        starSum += parseInt(ascent.rating);
        if (topCount < ntop) {
          topTotal += this.mapGrade(ascent.grade, 0);
          topCount++;
        }
        totalCommentLen += ascent.commentLength;
        numRecommend += ascent.recommend ? 1 : 0;
        soft += ascent.softness === "Soft" ? 1 : 0;
        hard += ascent.softness === "Hard" ? 1 : 0;
      }
      a.grade.avg = Math.round((10 * sum) / ascents.length) / 10;
      a.star.avg = Math.round((10 * starSum) / ascents.length) / 10;
      a.star.recommend = Math.round((100 * numRecommend) / ascents.length);
      a.grade.score = Math.round((10 * topTotal) / topCount) / 10;
      a.softness = (soft - hard) / ascents.length;
      a.softness = 5 + Math.round(50 * a.softness) / 10;
      a.comment.avgLen = Math.round(totalCommentLen / ascents.length);
      return a;
    },
    defaultChartOpts() {
      return {
        responsive: true,
        title: {
          display: false,
        },
        legend: {
          display: true,
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      };
    },
    initializeStats() {
      this.ascents = this.rawAscents.map((ascent) =>
        this.preprocessAscent(ascent, this.climberName)
      );
      let s = new Stat("ascents", ["comment"]);
      s.goDeeper(this.ascents);
      console.log("Analytics: ", s);
      this.stats = s;
      return new Promise((resolve) => {
        resolve();
      });
    },
    addDynamicChart(chartType, statBase, opts = {}) {
      // Default opts with must be defined.
      if (!opts.sortByName) {
        opts.sortByName = false;
      }
      if (!opts.limit) {
        opts.limit = 0;
      }
      // Create chart
      let dynamicChart = {
        type: chartType,
        statBase: statBase,
        opts: opts,
      };
      this.charts.dynamic.push(dynamicChart);
    },
    createChart(chartType, statBase, opts) {
      let stat = this.stats.getFiltered(statBase, opts.filters);
      let dynamicChart = {
        type: chartType,
        title: opts.title || this.prettyCapitalize(statBase) + " Chart",
        statBase: statBase,
        opts: opts,
        chartOpts: opts.chartOpts || this.defaultChartOpts(),
      };
      if (opts.subtitleFxn) {
        dynamicChart["subtitle"] = opts.subtitleFxn(stat);
      } else if (opts.autoGenerateSubtitle) {
        dynamicChart["subtitle"] =
          stat.count +
          " Ascents, " +
          stat.subStatCount() +
          " " +
          this.prettyCapitalize(statBase) +
          "s" +
          (opts.limit ? ", Top " + opts.limit : "");
      }
      switch (chartType) {
        case "bar":
        case "pie":
          dynamicChart.chartData = this.getPieChartData(stat, opts);
          // Save the original colors in a color map and persist them to prevent new random ones being assigned
          dynamicChart.opts["colors"] =
            dynamicChart.opts["colors"] ||
            dynamicChart.chartData.datasets[0].backgroundColor.reduce(function (
              colorMap,
              field,
              index
            ) {
              colorMap[dynamicChart.chartData.labels[index]] = field;
              return colorMap;
            },
            {});
          // Disable legend on pie if more than 20 entries
          dynamicChart.chartOpts.legend = {
            display:
              chartType === "pie" && dynamicChart.chartData.labels.length < 8,
          };
          break;
        case "grade":
          dynamicChart.chartData = this.getGradeChartData(stat, true, opts);
          break;
        default:
          console.warn(
            this.formatString(
              "Chart Type [{}], not supported on dynamic charts",
              chartType
            )
          );
      }
      return dynamicChart;
    },
  },
  created() {
    this.loading = true;
    setTimeout(() => {
      this.initializeStats()
        .then(() => {
          // Grade Counts
          let gradeOpts = this.defaultChartOpts();
          gradeOpts["scales"] = {
            xAxes: [{ stacked: true }],
            yAxes: [{ stacked: true }],
          };
          this.addDynamicChart("grade", "grade", {
            title: "Ascents per Grade",
            chartOpts: gradeOpts,
          });
          // Area Counts
          this.addDynamicChart("pie", "area", {
            autoGenerateSubtitle: true,
          });
          // year counts
          this.addDynamicChart("bar", "year", {
            sortByName: true,
            autoGenerateSubtitle: true,
          });
          // Month
          this.addDynamicChart("bar", "month", {
            sortByName: true,
          });
          // Softness, rating and recommend
          this.addDynamicChart("bar", "rating", {
            sortByName: true,
          });
          this.addDynamicChart("pie", "softness", {
            sortByName: true,
          });
          this.addDynamicChart("pie", "recommend", {
            sortByName: true,
          });
          this.initialized = true;
          this.loading = false;
          this.$emit("initialized");
        })
        .catch((error) => {
          window.alert(error.msg || error);
        });
    }, 250);
  },
  updated() {
    this.loading = false;
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
#climber-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
