<script>
import { Line, mixins } from "vue-chartjs";
import zoom from "chartjs-plugin-zoom";
export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: Object,
    options: Object,
  },
  mounted() {
    this.addPlugin(zoom);
    this.renderChart(this.chartData, this.options);
  },
};
</script>
