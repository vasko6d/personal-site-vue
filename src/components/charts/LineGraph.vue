<script>
import { Line } from "vue-chartjs";
import zoom from "chartjs-plugin-zoom";
export default {
  extends: Line,
  props: {
    data: Array,
    options: Object,
    seriesOpts: Array,
  },
  mounted() {
    this.addPlugin(zoom);
    this.renderChart(this.buildChartDataset(), this.options);
  },
  methods: {
    buildChartDataset() {
      let datasets = [];
      for (let seriesOpt of this.seriesOpts) {
        datasets.push({
          backgroundColor: seriesOpt.color,
          borderColor: seriesOpt.color,
          borderWidth: seriesOpt.borderWidth,
          label: seriesOpt.label,
          fill: false,
          pointRadius: 2,
          pointBackgroundColor: seriesOpt.color,
          pointBorderColor: seriesOpt.color,
          data: [],
        });
      }
      for (let datum of this.data) {
        for (let j = 0; j < this.seriesOpts.length; j++) {
          // remove duplicate values
          if (datasets[j].data.length > 0) {
            let prevY = datasets[j].data[datasets[j].data.length - 1].y;
            if (prevY === datum[j + 1]) {
              continue;
            }
          }
          datasets[j].data.push({ x: datum[0], y: datum[j + 1] });
        }
      }
      // add a final point at final time to make graphs go to end
      let tf = this.data[this.data.length - 1][0];
      for (let j = 0; j < this.seriesOpts.length; j++) {
        datasets[j].data.push({
          x: tf,
          y: datasets[j].data[datasets[j].data.length - 1].y,
        });
      }
      return {
        datasets: datasets,
      };
    },
  },
};
</script>
