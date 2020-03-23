<script>
import { Bar, mixins } from "vue-chartjs";
export default {
  extends: Bar,
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
