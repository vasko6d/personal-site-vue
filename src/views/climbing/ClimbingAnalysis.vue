<template>
  <div id="ticklist-analysis">
    <h1>{{ climberName }}'s Scorecard Analysis</h1>
    <div>
      <div class="opt-header icn" @click="showClimbers = !showClimbers">
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

    <div class="flex-row">
      <div class="chart md bg1">
        <h2>Climber Stats:</h2>
        <div>Area Timerange</div>
      </div>
      <div class="chart md bg1">
        <h2>{{ charts.areaCounts.title }}</h2>
        <div>
          {{ totalAscents }} Ascents, {{ charts.areaCounts.totalAreas }} Areas
        </div>
        <doughnut-chart
          :chartData="charts.areaCounts.chartData"
          :options="charts.areaCounts.chartOpts"
          style="cursor: pointer;"
        />
      </div>
    </div>
    <h2>Dynamic Charts: {{ prevArea }}</h2>
    <div class="flex-row">
      <div
        v-for="adhocChart in charts.adhoc"
        :key="adhocChart.id"
        class="chart sm bg1"
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
      <div class="chart sm icn bg1">
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
      totalAscents: 0,
      charts: {
        areaCounts: {},
        yearCounts: {},
        adhoc: []
      },
      stats: new Stat("ascents"),
      opts: {
        areaCounts: {
          responsive: true,
          title: {
            display: false,
            text: "",
            format: "Ascents per Area ({0} ascents, {1} areas)"
          },
          legend: {
            display: false
          },
          onClick: this.clickHandler
        }
      },
      prevArea: ALLAREAS,
      showClimbers: false
    };
  },
  methods: {
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
      let updateMode = this.prevArea === ALLAREAS ? UM.ALLTOALL : UM.AREATOALL;
      let areaName = ALLAREAS;
      let prefixPath = [];
      if (event.length > 0) {
        let tmpAreaName = event[0]._model.label;
        if (tmpAreaName != this.prevArea) {
          areaName = tmpAreaName;
          updateMode =
            this.prevArea === ALLAREAS ? UM.ALLTOAREA : UM.AREATOAREA;
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

        this.prevArea = areaName;
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
          this.totalAscents = this.stats.count;
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
  },
  computed: {
    climberName() {
      return this.kebabToCap(this.sandboxId);
    }
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
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
