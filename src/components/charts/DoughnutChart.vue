<script>
import { Doughnut, mixins } from "vue-chartjs";
export default {
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: Object,
    options: Object,
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>
