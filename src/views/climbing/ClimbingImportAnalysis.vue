<template>
  <div id="import-analysis">
    <div>
      <div class="blk-container">
        <h1>Analysis Importer</h1>
        <div class="bg1">
          <p>
            Select a local JSON file of ascents from 8a.nu to view the analytics
            of a climber not in the sandbox
          </p>
          <div class="import-btn">
            <input
              type="file"
              ref="ascentFile"
              accept=".json"
              @change="onFileSelect($event)"
            />
          </div>
          <div
            v-if="ascentJsonFile"
            class="cbtn prm bg1-hvr bg1-txt-hvr"
            @click="onAnalyze()"
          >
            Analyze Climber
          </div>
        </div>
      </div>
    </div>
    <div v-if="this.ascentJson && this.ascentJson.totalItems">
      <h1>Analysis</h1>
      <div class="blk-container">
        <div class="bg1">
          <spinner
            v-show="loading"
            size="huge"
            message="Analyzing ..."
            :line-size="24"
          ></spinner>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "vue-simple-spinner";
export default {
  components: {
    Spinner,
  },
  data() {
    return {
      ascentJsonFile: undefined,
      ascentJson: undefined,
      loading: false,
    };
  },
  methods: {
    onFileSelect(event) {
      this.ascentJsonFile = event.srcElement.value;
    },
    onAnalyze() {
      let reader = new FileReader();
      reader.readAsText(this.$refs.ascentFile.files[0], "UTF-8");
      reader.onload = (evt) => {
        this.ascentJson = JSON.parse(evt.target.result);
        console.log(this.ascentJson.totalItems);
        this.loading = true;
      };
      reader.onerror = (evt) => {
        console.error(evt);
      };
    },
  },
};
</script>

<style lang="scss" scoped>
#import-analysis {
  display: flex;
  flex-direction: column;
  .blk-container {
    margin-bottom: 5px;
    margin-top: 5px;
    width: 100%;
  }
}
.bg1 {
  padding: 10px;
}
.cbtn:hover {
  cursor: pointer;
}
.import-btn {
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
