<template>
  <div id="import-analysis">
    <div>
      <div class="blk-container">
        <h1>Analysis Importer</h1>
        <div class="bg1">
          <p style="text-align: left;">
            Select a local JSON file of ascents from 8a.nu to view the analytics
            of a climber not in the sandbox. Get it by using the following url
            <strong>when logged into</strong> 8a.nu. If you click the below link
            it will take you to my ascent response. Simply change the section
            marked "user-name" to the kebab username of the user you want to
            analyze.
          </p>
          <p class="eight-a-url bg1-hvr bg1-txt-hvr" @click="goToMy8aJson()">
            https://www.8a.nu/api/users/<strong>{user-name}</strong>/ascents?category=bouldering&pageIndex=0&pageSize=<strong
              >{total-ascents}</strong
            >
          </p>
          <p style="text-align: left;">
            After using the above URL you should see a ton of text in the
            broswer. Right click anywhere and then click "Save as.." and save it
            somewhere on your computer (I did not figure out how to do this on
            my phone). Remember where you saved it then click the "Choose File"
            button below and find it. It looks specifically for ".json" files so
            make sure you save the file with a ".json" extension
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
    goToMy8aJson() {
      window.open(
        "https://www.8a.nu/api/users/david-vasko/ascents?category=bouldering&pageIndex=0&pageSize=4000",
        "_blank"
      );
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
          this.importError = "Bad Ascent File";
          alert(this.importError);
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
.eight-a-url {
  @extend.bg1;
  font-size: 10pt;
  margin: 15px;
  cursor: pointer;
}
</style>
