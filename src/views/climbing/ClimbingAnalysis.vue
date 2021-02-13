<template>
  <div id="ticklist-analysis">
    <div class="flex-row">
      <div class="chart bg1">
        <climber-select baseURL="/climbing/analytics/" />
      </div>
    </div>
    <spinner
      v-if="loading"
      size="huge"
      message="Fetching climber data ..."
      :line-size="24"
    ></spinner>
    <div v-else>
      <climber-analysis
        :climberName="climberName"
        :rawAscents="ascents"
      ></climber-analysis>
    </div>
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
import ClimberAnalysis from "@/components/climbing/ClimberAnalysis.vue";
import ClimberSelect from "@/components/climbing/ClimberSelect.vue";
import Spinner from "vue-simple-spinner";
export default {
  components: {
    ClimberSelect,
    ClimberAnalysis,
    Spinner,
  },
  mixins: [Utils],
  props: {
    sandboxId: String,
  },
  data() {
    return {
      ascents: [],
      loading: true,
    };
  },
  computed: {
    climberName() {
      return this.kebabToCap(this.sandboxId);
    },
  },
  created() {
    setTimeout(() => {
      this.fetchData(this.sandboxId)
        .then((result) => {
          console.log("fetched", result);
          this.ascents = result.ascents;
          this.loading = false;
        })
        .catch((error) => {
          window.alert(error.msg || error);
        });
    }, 250);
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
#ticklist-analysis {
  max-width: 1400px;
  display: inline-block;
}
</style>
