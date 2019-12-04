<template>
  <div id="ticklist-analysis">
    <h1>{{ climberName }}'s Scorecard Analysis</h1>
    <div class="flex-row">
      <div class="chart bg1">
        <climber-select baseURL="/climbing/analytics/" />
      </div>
    </div>
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
      ></chart-handler>
    </div>
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
import Stat from "@/mixins/Stat.js";
import Aggregate from "@/mixins/Aggregate.js";
import ChartHandler from "@/components/charts/ChartHandler.vue";
import ClimberSelect from "@/components/climbing/ClimberSelect.vue";
import StatFilter from "@/components/climbing/StatFilter.vue";
export default {
  components: {
    ChartHandler,
    ClimberSelect,
    StatFilter
  },
  mixins: [Utils],
  props: {
    sandboxId: String
  },
  data() {
    return {
      ascents: [],
      charts: {
        adhoc: [],
        dynamic: []
      },
      currentFilters: {
        area: null,
        year: null,
        recommend: null,
        grade: null,
        rating: null,
        flags: null,
        type: null
      },
      stats: new Stat("ascents", ["comment"]),
      showClimbers: false,
      initialized: false
    };
  },
  computed: {
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
          value: this.vScale(a.grade.score)
        });
        cStats.push({ name: "Average Stars", value: a.star.avg });
        cStats.push({ name: "Recommend %", value: a.star.recommend + "%" });
        cStats.push({ name: "Softness", value: a.softness + " / 10" });
        cStats.push({
          name: "Average Comment",
          value: a.comment.avgLen + " characters"
        });
        cStats.push({ name: "Earliest", value: da.firstDate });
        cStats.push({ name: "Most Recent", value: da.mostRecent });
        cStats.push({ name: "Days climbed", value: da.count });
        cStats.push({
          name: "Grade [Max, Avg]",
          value: [this.vScale(a.grade.max), this.vScale(a.grade.avg)].join(", ")
        });
      }
      return cStats;
    },
    climberName() {
      return this.kebabToCap(this.sandboxId);
    }
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
    changeBaseStat(newBaseStat, chartIndex) {
      this.$set(this.charts.dynamic[chartIndex], "statBase", newBaseStat);
      this.$delete(this.charts.dynamic[chartIndex].opts, "colors");
    },
    changeAggregator(opts, chartIndex) {
      if (opts.aggregator === null) {
        this.$delete(this.charts.dynamic[chartIndex].opts, "aggregateFxn");
        this.$delete(this.charts.dynamic[chartIndex].opts, "aggregateTitle");
      } else {
        let agg = Aggregate.fxns[opts.aggregator](opts.catagory, opts.value);
        this.$set(this.charts.dynamic[chartIndex].opts, "aggregateFxn", agg);
        this.$set(
          this.charts.dynamic[chartIndex].opts,
          "aggregateTitle",
          Aggregate.makeTitle(opts.aggregator, opts.catagory, opts.value)
        );
      }
    },
    clearFilters(catToClear) {
      if (catToClear) {
        this.$set(this.currentFilters, catToClear, null);
      } else {
        for (const cat of Object.keys(this.currentFilters)) {
          this.$set(this.currentFilters, cat, null);
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
        aggregator: false
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
        count: dates.length
      };
    },
    ascentAnalysis(stat, ntop = 10) {
      let ascents = stat.values;
      let a = {
        grade: {
          max: 0,
          min: 0,
          avg: 0,
          score: 0
        },
        star: {
          avg: 0,
          recommend: 0
        },
        comment: {
          avgLen: 0
        },
        softness: 0
      };
      if (ascents.length === 0) {
        return a;
      }
      ascents.sort((a, b) => {
        this.mapGrade(a.grade) - this.mapGrade(b.grade);
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
          display: false
        },
        legend: {
          display: true
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      };
    },
    initializeStats() {
      this.stats = new Stat("ascents", ["comment"]);
      this.stats.goDeeper(this.ascents);
      console.log("Analytics: ", this.stats);
      return new Promise(resolve => {
        resolve();
      });
    },
    addDynamicChart(chartType, statBase, opts = {}) {
      if (!opts.sortByName) {
        opts.sortByName = false;
      }
      let dynamicChart = {
        type: chartType,
        statBase: statBase,
        opts: opts
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
        chartOpts: opts.chartOpts || this.defaultChartOpts()
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
          "s";
      }
      switch (chartType) {
        case "bar":
        case "pie":
          dynamicChart.chartData = this.getPieChartData(stat, opts);
          // Save the original colors in a color map and persist them to prevent new random ones being assigned
          dynamicChart.opts["colors"] =
            dynamicChart.opts["colors"] ||
            dynamicChart.chartData.datasets[0].backgroundColor.reduce(function(
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
              chartType === "pie" && dynamicChart.chartData.labels.length < 8
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
    }
  },
  mounted() {
    this.fetchData(this.sandboxId)
      .then(result => {
        this.ascents = result.data;
        this.initializeStats().then(() => {
          this.initialized = true;
          // Grade Counts
          let gradeOpts = this.defaultChartOpts();
          gradeOpts["scales"] = {
            xAxes: [{ stacked: true }],
            yAxes: [{ stacked: true }]
          };
          this.addDynamicChart("grade", "grade", {
            title: "Ascents per Grade",
            chartOpts: gradeOpts
          });
          // Area Counts
          this.addDynamicChart("pie", "area", {
            autoGenerateSubtitle: true
          });
          // year counts
          this.addDynamicChart("bar", "year", {
            sortByName: true,
            autoGenerateSubtitle: true
          });
          // Softness, rating and recommend
          this.addDynamicChart("pie", "softness", {
            sortByName: true
          });
          this.addDynamicChart("pie", "rating", {
            sortByName: true
          });
          this.addDynamicChart("pie", "recommend", {
            sortByName: true
          });
          this.generateTimeSeries(this.stats.values);
        });
      })
      .catch(error => {
        window.alert(error.msg || error);
      });
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
