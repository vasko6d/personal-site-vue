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
            v-if="ascentJsonFile && !initialized"
            class="cbtn prm bg1-hvr bg1-txt-hvr"
            @click="onAnalyze()"
          >
            Analyze Climber
          </div>
        </div>
      </div>
    </div>
    <div v-if="this.climberName">
      <div class="blk-container">
        <climber-analysis
          :climberName="this.climberName"
          :rawAscents="this.ascentJson.ascents"
          @initialized="initialized = true"
        ></climber-analysis>
      </div>
    </div>
  </div>
</template>

<script>
import ClimberAnalysis from "@/components/climbing/ClimberAnalysis.vue";
export default {
  components: {
    ClimberAnalysis,
  },
  data() {
    return {
      ascentJsonFile: undefined,
      ascentJson: undefined,
      climberName: false,
      importError: undefined,
      initialized: false,
    };
  },
  methods: {
    onFileSelect(event) {
      this.climberName = undefined;
      this.initialized = false;
      this.ascentJsonFile = event.srcElement.value;
    },
    onAnalyze() {
      let reader = new FileReader();
      reader.readAsText(this.$refs.ascentFile.files[0], "UTF-8");
      reader.onload = (evt) => {
        this.ascentJson = JSON.parse(evt.target.result);
        if (
          this.ascentJson &&
          this.ascentJson.ascents &&
          this.ascentJson.ascents.length &&
          this.ascentJson.totalItems
        ) {
          this.climberName = this.ascentJson.ascents[0].userName;
          console.log(
            `Sucesfully parsed local JSON file for climber [${this.climberName}], with [${this.ascentJson.ascents.length}] climbs`
          );
        } else {
          this.importError = "Bad File";
          alert("Bad Json File");
        }
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
