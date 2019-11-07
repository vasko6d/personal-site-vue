<template>
  <div id="ticklist-analysis">
    <h1>Overall</h1>
    <doughnut-chart
      :chartData="chartData.areaCounts"
      :options="opts.areaCounts"
      class="chart"
    />
    <bar-graph
      :chartData="chartData.gradeCounts"
      :options="opts.gradeCounts"
      class="chart"
    />
  </div>
</template>

<script>
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
  data() {
    return {
      ascents: require("@/assets/json/8a-scorecard.json")["ascents"],
      chartData: {
        gradeCounts: {},
        areaCounts: {}
      },
      statData: new Stat("ascents"),
      opts: {
        gradeCounts: {
          responsive: true,
          title: {
            display: true,
            text: "Ascents per Grade",
            fontSize: 20
          },
          scales: {
            xAxes: [{ stacked: true }],
            yAxes: [{ stacked: true }]
          }
        },
        areaCounts: {
          responsive: true,
          title: {
            display: true,
            text: "Ascents per Area",
            fontSize: 20
          },
          legend: {
            display: false
          }
        }
      }
    };
  },
  methods: {
    runAnalysis() {
      let stats = new Stat("ascents");
      // Create nested stats object
      let catagories = Object.keys(this.ascents[0]);
      for (let k of catagories) {
        stats.addSubStat(k);
      }

      for (let ascent of this.ascents) {
        // Nested Stats Object!
        stats.increment(ascent);
        for (let k of catagories) {
          stats.get(k).increment(ascent);
          stats.get(k).incrementSubStat(ascent[k], ascent);
          for (let k2 of catagories) {
            if (k != k2) {
              stats
                .get(k)
                .get(ascent[k])
                .addSubStat(k2, ascent);
              stats
                .get(k)
                .get(ascent[k])
                .get(k2)
                .increment(ascent);
              stats
                .get(k)
                .get(ascent[k])
                .get(k2)
                .incrementSubStat(ascent[k2], ascent);
            }
          }
        }
      }
      console.log(stats);
      this.chartData.areaCounts = this.getPieChartData(
        stats.get("area"),
        (a, b) => b.count - a.count
      );
      this.opts.areaCounts.title.text =
        this.opts.areaCounts.title.text +
        " (" +
        stats.count +
        " ascents, " +
        stats.get("area").subStatCount() +
        " areas)";
      this.chartData.gradeCounts = this.getGradeChartData(stats.get("grade"));
    },
    incrCountObj(countObject, key) {
      if (countObject[key]) {
        countObject[key]++;
      } else {
        countObject[key] = 1;
      }
    },
    gradeChartData(gradeCounts) {
      let labs = Object.keys(gradeCounts);
      labs.sort((a, b) => a - b);
      let colors = [];
      for (let i = 0; i < labs.length; i++) {
        colors.push(this.getRandomColor());
      }
      return {
        datasets: [
          {
            data: labs.map(k => {
              return gradeCounts[k];
            }),
            backgroundColor: colors
          }
        ],
        labels: labs.map(k => {
          return "V" + k;
        })
      };
    }
  },
  mounted() {
    this.runAnalysis();
    console.log("Analytis Mounted");
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
  width: 600px;
  display: inline-block;
  @media only screen and (max-width: 700px) {
    width: auto;
    max-width: 90%;
  }
}
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
