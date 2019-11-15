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
        <div>{{ currentArea }}</div>
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
        <h2>{{ charts.areaCounts.title }}</h2>
        <div>
          {{ stats.count }} Ascents, {{ charts.areaCounts.totalAreas }} Areas
        </div>
        <doughnut-chart
          :chartData="charts.areaCounts.chartData"
          :options="charts.areaCounts.chartOpts"
          style="cursor: pointer;"
        />
      </div>
    </div>
    <h2>Dynamic Charts: {{ currentArea }}</h2>
    <div class="flex-row">
      <div
        v-for="adhocChart in charts.adhoc"
        :key="adhocChart.id"
        class="chart bg1"
      >
        <h2>{{ adhocChart.title }}</h2>
        <div v-if="adhocChart.type === 'pie'">
          <doughnut-chart
            :chartData="adhocChart.chartData"
            :options="adhocChart.chartOpts"
          />
        </div>
        <div v-else-if="adhocChart.type === 'grade'">
          <bar-graph
            :chartData="adhocChart.chartData"
            :options="adhocChart.chartOpts"
          />
        </div>
      </div>
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
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import BarGraph from "@/components/charts/BarGraph.vue";
export default {
  components: {
    DoughnutChart,
    BarGraph
  },
  mixins: [Utils],
  props: {
    sandboxId: String
  },
  data() {
    return {
      ascents: [],
      charts: {
        areaCounts: {},
        adhoc: []
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
      let stat =
        this.currentArea === ALLAREAS
          ? this.stats
          : this.stats.get("area").get(this.currentArea);
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
      if (ascents.length === 0) {
        return {};
      }
      ascents.sort((a, b) => {
        this.mapGrade(a.grade) - this.mapGrade(b.grade);
      });
      let a = {
        grade: {
          max: ascents[0].grade,
          min: Math.max(ascents[ascents.length - 1].grade, 0),
          avg: 0,
          score: 0
        },
        star: {
          avg: 0,
          recommend: 0
        },
        softness: 0
      };
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
    clickHandler(point, event) {
      const UM = {
        ALLTOAREA: 0,
        AREATOALL: 1,
        AREATOAREA: 2,
        ALLTOALL: 3
      };
      let updateMode =
        this.currentArea === ALLAREAS ? UM.ALLTOALL : UM.AREATOALL;
      let areaName = ALLAREAS;
      let prefixPath = [];
      if (event.length > 0) {
        let tmpAreaName = event[0]._model.label;
        if (tmpAreaName != this.currentArea) {
          areaName = tmpAreaName;
          updateMode =
            this.currentArea === ALLAREAS ? UM.ALLTOAREA : UM.AREATOAREA;
          prefixPath = ["area", areaName];
        }
      }

      if (updateMode != UM.ALLTOALL) {
        // Handle all adhoc charts
        for (let i = 0; i < this.charts.adhoc.length; i++) {
          let achart = this.charts.adhoc[i];
          if (achart.isAreaDynamic) {
            let newStatPath = achart.statPath;
            switch (updateMode) {
              case UM.ALLTOAREA:
                newStatPath = [...prefixPath, ...newStatPath];
                newStatPath[1] = areaName;
                break;
              case UM.AREATOAREA:
                newStatPath[1] = areaName;
                break;
              case UM.AREATOALL:
                newStatPath.shift();
                newStatPath.shift();
                break;
            }
            //console.log(achart.title + " - [" + newStatPath + "]");
            let newChart = this.createChart(
              achart.type,
              newStatPath,
              achart.opts
            );
            this.charts.adhoc[i] = newChart;
          }
        }

        this.currentArea = areaName;
      }
    },
    addAddhocChart(chartType, statPath, opts) {
      let adhocChart = this.createChart(chartType, statPath, opts);
      if (adhocChart.chartData) {
        this.charts.adhoc.push(adhocChart);
      }
    },
    createChart(chartType, statPath, opts) {
      let stat = this.stats.getFromPath(statPath);
      let adhocChart = {
        type: chartType,
        title: opts.title,
        isAreaDynamic: opts.isAreaDynamic || false,
        statPath: statPath,
        opts: opts,
        chartOpts: opts.chartOpts || this.defaultChartOpts()
      };
      switch (chartType) {
        case "pie":
          adhocChart.chartData = this.getPieChartData(stat, opts);
          // Save the original colors in a color map and persist them to prevent new random ones being assigned
          adhocChart.opts["colors"] =
            adhocChart.opts["colors"] ||
            adhocChart.chartData.datasets[0].backgroundColor.reduce(function(
              colorMap,
              field,
              index
            ) {
              colorMap[adhocChart.chartData.labels[index]] = field;
              return colorMap;
            },
            {});
          //console.log(adhocChart);
          break;
        case "grade":
          adhocChart.chartData = this.getGradeChartData(stat);
          break;
        default:
          console.warn(
            this.formatString(
              "Chart Type [{}], not supported on adhoc charts",
              chartType
            )
          );
      }
      return adhocChart;
    }
  },
  mounted() {
    this.fetchData(this.sandboxId)
      .then(result => {
        this.ascents = result.data;
        this.initializeStats().then(() => {
          this.initialized = true;
          // Area Counts
          let areaOpts = this.defaultChartOpts();
          areaOpts["onClick"] = this.clickHandler;
          areaOpts["legend"] = { display: false };
          this.charts.areaCounts = this.createChart("pie", ["area"], {
            title: "Ascents per Area",
            chartOpts: areaOpts,
            sortFxn: (a, b) => b.count - a.count
          });
          this.charts.areaCounts.totalAreas = this.stats
            .get("area")
            .subStatCount();
          // Grade Counts
          let gradeOpts = this.defaultChartOpts();
          gradeOpts["scales"] = {
            xAxes: [{ stacked: true }],
            yAxes: [{ stacked: true }]
          };
          this.addAddhocChart("grade", ["grade"], {
            title: "Ascents per Grade",
            isAreaDynamic: true,
            chartOpts: gradeOpts
          });
          // year counts
          this.addAddhocChart("pie", ["year"], {
            title: "Ascents by year",
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
          // Softness, rating and recommend
          this.addAddhocChart("pie", ["softness"], {
            title: "Soft Meter",
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
          this.addAddhocChart("pie", ["rating"], {
            title: "Star Meter",
            nameMap: { 0: "0 Stars", 1: "1 Star", 2: "2 Stars", 3: "3 Stars" },
            isAreaDynamic: true,
            sortFxn: (a, b) => (a.name > b.name ? 1 : -1)
          });
          this.addAddhocChart("pie", ["recommend"], {
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
