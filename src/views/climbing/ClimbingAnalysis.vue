<template>
  <div id="ticklist-analysis">
    <h1>{{ climberName }}</h1>
    <div class="chart">
      <h2>{{ opts.areaCounts.title.text }}</h2>
      <doughnut-chart
        :chartData="chartData.areaCounts"
        :options="opts.areaCounts"
        style="cursor: pointer;"
      />
    </div>
    <div class="chart">
      <h2>{{ opts.gradeCounts.title.text }}</h2>
      <bar-graph
        :chartData="chartData.gradeCounts"
        :options="opts.gradeCounts"
      />
    </div>
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
  props: {
    sandboxId: String
  },
  data() {
    return {
      ascents: [],
      chartData: {
        gradeCounts: {},
        areaCounts: {}
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
        }
      }
    };
  },
  methods: {
    initializeStats() {
      this.stats = new Stat("ascents", ["comment"]);
      this.stats.goDeeper(this.ascents);
      console.log(this.stats);
      this.chartData.areaCounts = this.getPieChartData(
        this.stats.get("area"),
        (a, b) => b.count - a.count
      );
      this.opts.areaCounts.title.text = this.formatString(
        this.opts.areaCounts.title.format,
        this.stats.count,
        this.stats.get("area").subStatCount()
      );
      this.chartData.gradeCounts = this.getGradeChartData(
        this.stats.get("grade")
      );
      this.opts.gradeCounts.title.text = this.formatString(
        this.opts.gradeCounts.title.format,
        "All Areas"
      );
    },
    clickHandler(point, event) {
      let areaName = "All Areas";
      if (event.length === 0) {
        this.chartData.gradeCounts = this.getGradeChartData(
          this.stats.get("grade")
        );
      } else {
        areaName = event[0]._model.label;
        this.chartData.gradeCounts = this.getGradeChartData(
          this.stats
            .get("area")
            .get(areaName)
            .get("grade")
        );
      }
      this.opts.gradeCounts.title.text = this.formatString(
        this.opts.gradeCounts.title.format,
        areaName
      );
    }
  },
  mounted() {
    this.fetchData(this.sandboxId)
      .then(result => {
        this.ascents = result.data;
        this.initializeStats();
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
