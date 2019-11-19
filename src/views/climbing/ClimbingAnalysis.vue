<template>
  <div id="ticklist-analysis">
    <h1>{{ climberName }}'s Scorecard Analysis</h1>
    <div>
      <div class="icn b" @click="showClimbers = !showClimbers">
        Climber Select
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showClimbers,
            'fa-angle-up': showClimbers
          }"
        ></i>
      </div>
    </div>
    <div v-show="showClimbers" class="flex-row">
      <ul style="list-style-type:none ">
        <li
          class="icn"
          @click="navigate(climber.sandboxId)"
          v-for="climber in importedClimbers"
          :key="climber.id"
        >
          {{ climber.name }}
        </li>
      </ul>
    </div>

    <div class="flex-row">
      <div class="chart bg1">
        <h2>Climber Stats:</h2>
        <div class="flex-row">
          <table class="climber-stats">
            <tr v-for="cStat in climberStats" :key="cStat.id">
              <td class="stat-name">{{ cStat.name }}</td>
              <td>{{ cStat.value }}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="chart bg1">
        <h2>Filters:</h2>
        <div class="b">
          Current Filters:&nbsp;
          <i class="fas fa-eraser icn" @click="clearFilters()"></i>
        </div>
        <div v-if="Object.keys(currentFilters).length === 0">none</div>
        <div v-else>
          <div
            v-for="catagory in Object.keys(currentFilters)"
            :key="catagory.id"
          >
            {{ catagory }} = {{ currentFilters[catagory] }}
          </div>
        </div>
        <div class="b">Add New Filter:</div>
        <div>
          <span v-if="newFilter.catagory != ''">
            {{ newFilter.catagory }} >
            <span v-if="newFilter.value != ''">
              {{ newFilter.value }}
              <i class="fas fa-check icn" @click="addFilter(newFilter)"></i
              >&nbsp;
            </span>
            <span v-else>
              <select v-model="newFilter.value">
                <option
                  v-for="val in stats.get(newFilter.catagory).subStats"
                  :key="val.id"
                  :value="val.name"
                  >{{ val.name }}</option
                >
              </select>
            </span>
            <i
              class="fas fa-times icn"
              @click="newFilter = generateFilter()"
            ></i>
          </span>
          <span v-else>
            <select v-model="newFilter.catagory">
              <option
                v-for="filter in filterable"
                :key="filter.id"
                :value="filter"
                >{{ filter }}</option
              >
            </select>
          </span>
        </div>
      </div>
    </div>
    <h2>Dynamic Charts</h2>
    <div class="flex-row">
      <chart-handler
        v-show="!dynamicChart.opts.hideChart"
        v-for="dynamicChart in charts.dynamic"
        :key="dynamicChart.id"
        :chart="dynamicChart"
      ></chart-handler>
    </div>
    <!--
    <h2>Adhoc Charts:</h2>
    <div class="flex-row">
      <div class="chart icn bg1">
        <h2>...add new chart</h2>
        <i class="fas fa-plus fa-7x"></i>
      </div>
    </div>
    -->
  </div>
</template>

<script>
const ALLAREAS = "All Areas";
import Utils from "@/mixins/Utils.js";
import Stat from "@/mixins/Stat.js";
import ChartHandler from "@/components/charts/ChartHandler.vue";
export default {
  components: {
    ChartHandler
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
      filterable: ["area", "year", "recommend", "grade", "rating"],
      newFilter: this.generateFilter(),
      currentFilters: {},
      aggregateFxns: {
        avg(subName) {
          return stat => {
            let sub = stat.get(subName).subStats;
            let sum = 0;
            let cnt = 0;
            for (const subKey of Object.keys(sub)) {
              cnt += sub[subKey].count;
              sum += sub[subKey].count * parseInt(subKey);
            }
            return Math.round((10 * sum) / cnt) / 10;
          };
        },
        pct(subName, value) {
          return stat => {
            let sub = stat.get(subName).subStats;
            let sum = 0;
            let cnt = 0;
            for (const subKey of Object.keys(sub)) {
              cnt += sub[subKey].count;
              if (sub[subKey].name == value) {
                sum += sub[subKey].count * parseInt(subKey);
              }
            }
            return Math.round((1000 * sum) / cnt) / 10;
          };
        }
      },
      stats: new Stat("ascents"),
      currentArea: ALLAREAS,
      showClimbers: false,
      initialized: false,
      importedClimbers: [
        {
          name: "Chase Yamashiro",
          sandboxId: "chase-yamashiro"
        },
        { name: "David Vasko", sandboxId: "david-vasko" },
        { name: "Scott Baron", sandboxId: "scott-baron" },
        {
          name: "Nathaniel Cushing-Murray",
          sandboxId: "nathaniel-cushing-murray"
        },
        { name: "Drew Gomberg", sandboxId: "drew-gomberg" },
        {
          name: "Daniel Fineman",
          sandboxId: "daniel-fineman"
        },
        { name: "Daniel Fong", sandboxId: "daniel-fong" }
      ]
    };
  },
  computed: {
    climberStats() {
      let stat = this.stats.getFiltered(false, this.currentFilters);
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
    clearFilters() {
      // Update Dynamic Charts
      for (let i = 0; i < this.charts.dynamic.length; i++) {
        let dChart = this.charts.dynamic[i];
        let newOpts = dChart.opts;
        newOpts.filters = {};
        newOpts.hideChart = false;
        this.charts.dynamic[i] = this.createChart(
          dChart.type,
          dChart.statBase,
          newOpts
        );
      }
      this.currentFilters = {};
    },
    addFilter(filter) {
      //this.currentFilters[filter.catagory] = filter.value;
      this.$set(this.currentFilters, filter.catagory, filter.value);
      // Update Dynamic Charts
      for (let i = 0; i < this.charts.dynamic.length; i++) {
        let dChart = this.charts.dynamic[i];
        if (dChart.statBase != filter.catagory) {
          let newOpts = dChart.opts;
          if (newOpts.filters) {
            newOpts.filters[filter.catagory] = filter.value;
          } else {
            newOpts["filters"] = {};
            newOpts.filters[filter.catagory] = filter.value;
          }
          this.charts.dynamic[i] = this.createChart(
            dChart.type,
            dChart.statBase,
            newOpts
          );
        } else {
          this.charts.dynamic[i].opts.hideChart = true;
        }
      }
      // Reset new filter
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
    navigate(sandboxId) {
      if (this.sandboxId != sandboxId) {
        this.$router.push("/climbing/analytics/" + sandboxId);
      }
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
      let hard = 0;
      let soft = 0;
      for (const ascent of ascents) {
        sum += this.mapGrade(ascent.grade);
        starSum += parseInt(ascent.rating);
        if (topCount < ntop) {
          topTotal += this.mapGrade(ascent.grade);
          topCount++;
        }
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
        }
      };
    },
    initializeStats() {
      this.stats = new Stat("ascents", ["comment"]);
      this.stats.goDeeper(this.ascents);
      console.log(this.stats);
      return new Promise(resolve => {
        resolve();
      });
    },
    addDynamicChart(chartType, statBase, opts) {
      let dynamicChart = this.createChart(chartType, statBase, opts);
      if (dynamicChart.chartData) {
        this.charts.dynamic.push(dynamicChart);
      }
    },
    createChart(chartType, statBase, opts) {
      let stat = this.stats.getFiltered(statBase, opts.filters);
      let dynamicChart = {
        type: chartType,
        title: opts.title,
        isAreaDynamic: opts.isAreaDynamic || false,
        statBase: statBase,
        opts: opts,
        chartOpts: opts.chartOpts || this.defaultChartOpts()
      };
      if (opts.subtitleFxn) {
        dynamicChart["subtitle"] = opts.subtitleFxn(stat);
      }
      switch (chartType) {
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
          //console.log(dynamicChart);
          break;
        case "grade":
          dynamicChart.chartData = this.getGradeChartData(stat);
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
            isAreaDynamic: true,
            chartOpts: gradeOpts
          });
          // Area Counts
          let areaOpts = this.defaultChartOpts();
          areaOpts["legend"] = { display: false };
          this.addDynamicChart("pie", "area", {
            title: "Ascents per Area",
            chartOpts: areaOpts,
            subtitleFxn: stat => {
              return stat.count + " Ascents, " + stat.subStatCount() + " Areas";
            }
          });
          // year counts
          this.addDynamicChart("pie", "year", {
            title: "Ascents by year",
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
          // Softness, rating and recommend
          this.addDynamicChart("pie", "softness", {
            title: "Soft Meter",
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
          this.addDynamicChart("pie", "rating", {
            title: "Star Meter",
            nameMap: {
              0: "0 Stars",
              1: "1 Star",
              2: "2 Stars",
              3: "3 Stars"
            },
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
          this.addDynamicChart("pie", "recommend", {
            title: "Recommend Meter",
            nameMap: { true: "Recommended", false: "Not Recommended" },
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
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
.chart {
  width: 390px;
  @media only screen and (max-width: 700px) {
    width: 90%;
  }
  //border: 2px solid;
  //border-radius: 0.5em;
  margin: 5px;
  padding: 10px;
  margin-bottom: 0.5em;
}
.flex-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.stat-name {
  font-weight: bold;
}
.climber-stats {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
