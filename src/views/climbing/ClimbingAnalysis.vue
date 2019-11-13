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
        <h3>Area Timerange</h3>
      </div>
      <div class="chart md bg1">
        <h2>{{ opts.areaCounts.title.text }}</h2>
        <doughnut-chart
          :chartData="charts.areaCounts"
          :options="opts.areaCounts"
          style="cursor: pointer;"
        />
      </div>
    </div>
    <h2>Dynamic Charts: {{ prevArea }}</h2>
    <div class="flex-row">
      <div class="chart md bg1">
        <h2>{{ opts.gradeCounts.title.text }}</h2>
        <bar-graph
          :chartData="charts.gradeCounts"
          :options="opts.gradeCounts"
        />
      </div>
      <div
        v-for="adhocChart in charts.adhoc"
        :key="adhocChart.id"
        class="chart sm bg1"
      >
        <h2>{{ adhocChart.title }}</h2>
        <doughnut-chart
          :chartData="adhocChart.chartData"
          :options="opts.default"
        />
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
      charts: {
        gradeCounts: {},
        areaCounts: {},
        yearCounts: {},
        adhoc: []
      },
      stats: new Stat("ascents"),
      opts: {
        gradeCounts: {
          responsive: true,
          title: {
            display: false,
            text: "",
            format: "Ascents per Grade: {0}"
          },
          scales: {
            xAxes: [{ stacked: true }],
            yAxes: [{ stacked: true }]
          }
        },
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
        },
        default: {
          responsive: true,
          title: {
            display: false
          },
          legend: {
            display: true
          }
        }
      },
      prevArea: ALLAREAS,
      showClimbers: false
    };
  },
  methods: {
    initializeStats() {
      this.stats = new Stat("ascents", ["comment"]);
      this.stats.goDeeper(this.ascents);
      console.log(this.stats);
      this.charts.areaCounts = this.getPieChartData(this.stats.get("area"), {
        sortFxn: (a, b) => b.count - a.count
      });
      this.opts.areaCounts.title.text = this.formatString(
        this.opts.areaCounts.title.format,
        this.stats.count,
        this.stats.get("area").subStatCount()
      );
      this.charts.gradeCounts = this.getGradeChartData(this.stats.get("grade"));
      this.opts.gradeCounts.title.text = this.formatString(
        this.opts.gradeCounts.title.format,
        ALLAREAS
      );
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
      let gradePath = ["grade"];
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
        // Handle Special Grade Chart
        gradePath = [...prefixPath, ...gradePath];
        this.charts.gradeCounts = this.getGradeChartData(
          this.stats.getFromPath(gradePath)
        );
        this.opts.gradeCounts.title.text = this.formatString(
          this.opts.gradeCounts.title.format,
          areaName
        );
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
            let newChart = this.createAdhocChart(
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
      let adhocChart = this.createAdhocChart(chartType, statPath, opts);
      if (adhocChart.chartData) {
        this.charts.adhoc.push(adhocChart);
      }
    },
    createAdhocChart(chartType, statPath, opts) {
      let stat = this.stats.getFromPath(statPath);
      let adhocChart = {
        type: chartType,
        title: opts.title,
        isAreaDynamic: opts.isAreaDynamic || false,
        statPath: statPath,
        opts: opts
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
        window.alert(error.msg);
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
