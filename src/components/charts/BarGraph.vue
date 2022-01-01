<script>
import { Bar, mixins } from "vue-chartjs";
import { SortStackedBarByValue } from "@/mixins/SortStackedBarByValuePlugin";
Chart.plugins.unregister(SortStackedBarByValue);
export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: Object,
    options: Object,
  },
  mounted() {
    this.addPlugin(SortStackedBarByValue);
    this.renderChart(this.chartData, this.options);
  },
};
</script>
