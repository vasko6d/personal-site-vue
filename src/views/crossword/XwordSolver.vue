<template>
  <div id="crossword">
    <div v-if="loadingMessage">
      <spinner size="huge" :line-size="24"></spinner>
      <div>{{ loadingMessage }}</div>
    </div>
    <div v-else class="blk-container">
      <div style="height: 0; overflow: hidden">
        <input
          type="text"
          ref="psuedo-input"
          style="opacity: 0"
          purpose="To trick the phone into bringing up its keyboard"
        />
      </div>
      <xword-header
        :title="xword.title"
        :author="xword.author"
        :publishDate="xword.publishDate"
        :timer="xword.timer"
        :themeExp="xword.theme"
        :note="xword.note"
        :completed="xword.completed"
        @flagCell="executePress('$FLAGCELL')"
        @specialEdit="executePress('$SPECIALEDIT')"
        @toggleNativeKeyboard="
          keyboardMasterOverride = !keyboardMasterOverride;
          specialKeyboard();
        "
        @setOption="setOption"
        @disableNativeKeyboard="
          keyboardMasterOverride = false;
          specialKeyboard();
        "
        @defaultSettings="opts = defaultOpts(true)"
        @clear="clear"
        @solve="solve"
        @saveProgress="saveProgress"
        :nativeKeyboardEnabled="keyboardMasterOverride"
        :opts="opts"
      />
      <xword-stat-banner
        v-show="xword.filled"
        :isCompleted="xword.completed"
        :showErrors="opts.errors.showErrors"
        :stats="xword.stats"
        :statData="xword.statData"
        @setOption="setOption"
        @clear="clear"
        @solve="solve"
      />
      <xword-current-clue
        v-show="opts.currentClue.loc === 'top'"
        :clue="currentClue"
        @executePress="executePress"
      />
      <xword-puzzle
        :puzzle="xword.puzzle"
        :r="xword.r"
        :c="xword.c"
        :isHoriz="xword.isHoriz"
        :acrossNum="acrossNum"
        :downNum="downNum"
        :showErrors="opts.errors.showErrors"
        @executePress="executePress"
        @specialKeyboard="specialKeyboard"
        @updateShownWrong="updateShownWrong"
      />
      <xword-current-clue
        v-show="opts.currentClue.loc === 'bottom'"
        :clue="currentClue"
        @executePress="executePress"
      />
      <xword-keyboard
        v-show="opts.keyboard.showOnPageKeyboard"
        @executePress="executePress"
      />
      <xword-clue-panel
        v-if="opts.clues.showCluePanel"
        :acrossClueObj="xword.across"
        :downClueObj="xword.down"
        :r="xword.r"
        :c="xword.c"
        :curCellValue="xword.getCell().entry"
        :curCellFlag="xword.getCell().flag"
        :showContextKey="showContextKey"
        :acrossNum="acrossNum"
        :downNum="downNum"
        :puzzleIsHoriz="xword.isHoriz"
        :opts="opts"
        @executePress="executePress"
      />
    </div>
  </div>
</template>

<script>
import XwordPuzzle from "@/components/crossword/XwordPuzzle.vue";
import XwordCluePanel from "@/components/crossword/XwordCluePanel.vue";
import XwordCurrentClue from "@/components/crossword/XwordCurrentClue.vue";
import XwordKeyboard from "@/components/crossword/XwordKeyboard.vue";
import XwordHeader from "@/components/crossword/XwordHeader.vue";
import XwordStatBanner from "@/components/crossword/XwordStatBanner.vue";
import Xword from "@/components/crossword//Xword.js";

import Spinner from "vue-simple-spinner";
export default {
  name: "crossword",
  beforeRouteLeave(to, from, next) {
    this.saveProgress();
    next();
  },
  components: {
    XwordCluePanel,
    XwordPuzzle,
    XwordCurrentClue,
    XwordKeyboard,
    XwordHeader,
    XwordStatBanner,
    Spinner,
  },
  props: {
    xwordId: String,
  },
  data() {
    return {
      opts: this.defaultOpts(),
      loadingMessage: "Loading Crossword...",
      showOptions: false,
      showHelp: false,
      showTools: false,
      xword: new Xword("", "", "", "", [], {}, {}),
      clickedClue: {}, // hacky to make clue context togglable....
      contextEnabled: false,
      forceSpecialKeyboard: false,
      keyboardMasterOverride: false,
    };
  },
  computed: {
    currentClue() {
      let cell = this.xword.getCell();
      let isAcross = this.xword.isHoriz;
      let num = isAcross ? cell.acrossNum : cell.downNum;
      let entry = isAcross ? this.xword.across[num] : this.xword.down[num];
      let txt = entry ? entry.txt : "";
      return {
        num: num,
        txt: txt,
        isAcross: isAcross,
      };
    },
    showContextKey() {
      return (
        this.clickedClue.prev +
        "|" +
        this.clickedClue.next +
        "|" +
        this.contextEnabled +
        "|" +
        this.clickedClue.wasAutoSolved
      );
    },
    acrossNum() {
      return this.xword.getCell().acrossNum;
    },
    downNum() {
      return this.xword.getCell().downNum;
    },
  },
  mounted() {
    this.fetchXword().then((raw) => {
      this.xword = new Xword(
        raw.title,
        raw.author,
        raw.editor,
        raw.createDate,
        raw.solution,
        raw.clues.across,
        raw.clues.down,
        raw.theme,
        raw.note,
        { shapeCells: raw.shapeCells, colorCells: raw.colorCells }
      );
      if (localStorage[`xword:${this.xwordId}`]) {
        const progress = JSON.parse(localStorage[`xword:${this.xwordId}`]);
        this.xword.reloadSavedData(progress);
      }
      if (localStorage["xwordOpts"]) {
        const cachedOpts = JSON.parse(localStorage["xwordOpts"]);

        // To prevent stale opts in localStorage assign current opts with falues from cached ones
        this.useCachedOpt(cachedOpts, ["clues", "showCluePanel"]);
        this.useCachedOpt(cachedOpts, ["clues", "contextOpt"]);
        this.useCachedOpt(cachedOpts, ["clues", "hideClueOpt"]);
        this.useCachedOpt(cachedOpts, ["errors", "showErrors"]);
        this.useCachedOpt(cachedOpts, ["keyboard", "showOnPageKeyboard"]);
        this.useCachedOpt(cachedOpts, [
          "keyboard",
          "enableNativeKeyboardToggle",
        ]);
        this.useCachedOpt(cachedOpts, ["navigation", "autoSkipFilledCells"]);
        this.useCachedOpt(cachedOpts, ["currentClue", "loc"]);
      }
      this.loadingMessage = undefined;
      console.log(this.xword);
    });
  },
  methods: {
    fetchXword() {
      // TODO once a back end exists  creat an endpoint of DB view to fetch this all in one go
      return new Promise((resolve, reject) => {
        fetch(`/json/xwords/headers.json`)
          .then((response) => {
            response.json().then((json) => {
              let xword = json.headers.find((h) => h.id === this.xwordId);
              const promises = [];

              // Fetch the Solution
              promises.push(
                new Promise((resolve1) => {
                  fetch(`/json/xwords/solutions/${this.xwordId}.json`).then(
                    (response) => {
                      response.json().then((json) => {
                        xword.solution = json.solution;
                        resolve1();
                      });
                    }
                  );
                })
              );

              // Fetch the Clues
              promises.push(
                new Promise((resolve2) => {
                  fetch(`/json/xwords/clues/${this.xwordId}.json`).then(
                    (response) => {
                      response.json().then((json) => {
                        // Preprocess clues into an obejct
                        for (const [key, txt] of Object.entries(json.across)) {
                          json.across[key] = { txt };
                        }
                        for (const [key, txt] of Object.entries(json.down)) {
                          json.down[key] = { txt };
                        }
                        xword.clues = json;
                        resolve2();
                      });
                    }
                  );
                })
              );

              // Fetch the Options if specified
              if (xword.optionId) {
                promises.push(
                  new Promise((resolve3) => {
                    fetch(`/json/xwords/options/${xword.optionId}.json`).then(
                      (response) => {
                        response.json().then((json) => {
                          xword = { ...xword, ...json };
                          resolve3();
                        });
                      }
                    );
                  })
                );
              }

              // Wait until all are done then return the processed xword
              return Promise.all(promises).then(() => resolve(xword));
            });
          })
          .catch((e) => {
            console.error(e);
            reject({
              msg: `Failed To fetch Crossword with Id =[${this.xwordId}]`,
            });
          });
      });
    },
    // fetchData(xwordId) {
    //   return new Promise((resolve, reject) => {
    //     fetch(`/json/xwords/${xwordId}.json`)
    //       .then((raw) => resolve(raw.json()))
    //       .catch((e) => {
    //         console.error(e);
    //         const ret = {
    //           msg: this.formatString(
    //             "CrossWord with Id [{0}] not avaliable",
    //             xwordId
    //           ),
    //         };
    //         reject(ret);
    //       });
    //   });
    // },
    clear(clearType) {
      switch (clearType) {
        case "puzzle":
          this.xword.clear(true, true, true);
          break;
        case "flags":
          this.xword.clear(true, false);
          break;
        case "wrong":
          this.xword.clear(false, true);
          break;
        case "clue":
          this.xword.clearClue();
          break;
      }
      this.saveProgress();
    },
    solve(solveType) {
      switch (solveType) {
        case "puzzle":
          console.log("[SOLVE] Puzzle");
          this.xword.solvePuzzle();
          break;
        case "clue":
          console.log("[SOLVE] Clue");
          this.xword.solveClue();
          break;
        case "cell":
          console.log("[SOLVE] Cell");
          this.xword.solveCurrentCell();
          break;
      }
      this.saveProgress();
    },
    updateShownWrong(cell) {
      this.xword.updateShownErrorFlag(cell.r, cell.c);
    },
    saveProgress() {
      localStorage["xword:" + this.xwordId.toString()] = JSON.stringify(
        this.xword.saveData()
      );
      //console.log("Progress saved for [" + this.xword.title + "]");
    },
    useCachedOpt(cachedOpts, path) {
      let cachedOpt = cachedOpts;
      let trueOpt = this.opts;
      for (let i = 0; i < path.length; i++) {
        if (!cachedOpt) {
          return;
        }
        cachedOpt = cachedOpt[path[i]];
        if (i < path.length - 1) {
          trueOpt = trueOpt[path[i]];
        }
      }
      //console.log("Setting: " + path + " to [" + cachedOpt + "]");
      trueOpt[path[path.length - 1]] = cachedOpt;
    },
    defaultOpts(save = false) {
      let ret = {
        clues: {
          showCluePanel: true,
          contextOpt: "always",
          contextOpts: [
            { name: "Always show clue context", val: "always" },
            { name: "Click clue to toggle context", val: "toggle" },
            { name: "Never show clue context", val: "never" },
          ],
          hideClueOpt: "never",
          hideClueOpts: [
            {
              name: "Hide clues that are CORRECT and filled",
              val: "onCorrect",
            },
            { name: "Hide clues that are filled", val: "onFill" },
            { name: "Never hide clues", val: "never" },
          ],
        },
        keyboard: {
          showOnPageKeyboard: true,
          enableNativeKeyboardToggle: false,
        },
        currentClue: {
          loc: "top",
          locOpts: [
            { name: "Show curernt clue ABOVE grid", val: "top" },
            { name: "Show current clue BELOW grid", val: "bottom" },
          ],
        },
        errors: {
          showErrors: false,
        },
        navigation: {
          autoSkipFilledCells: true,
        },
      };
      if (save) {
        localStorage["xwordOpts"] = JSON.stringify(ret);
      }
      return ret;
    },
    setOption(p) {
      let opt = this.opts;
      for (let i = 0; i < p.optionPath.length - 1; i++) {
        opt = opt[p.optionPath[i]];
      }
      opt[p.optionPath[p.optionPath.length - 1]] = p.value;
      if (!p.dontSave) {
        localStorage["xwordOpts"] = JSON.stringify(this.opts);
      }
    },
    specialKeyboard(force = false) {
      let cell = this.xword.getCell();
      if (
        !cell.wasAutoSolved &&
        (this.keyboardMasterOverride || cell.isSpecialInput || force)
      ) {
        //console.log("...bringing up special edit keyboard");
        this.$refs["psuedo-input"].focus({ preventScroll: true });
      } else {
        //console.log("...hiding up special edit keyboard");
        this.$refs["psuedo-input"].blur({ preventScroll: true });
      }
    },
    executePress(ch, opts) {
      //console.log("executePress: ", ch, ", Options: ", opts);

      // All press/action handler
      if (ch.startsWith("$")) {
        this.forceSpecialKeyboard =
          opts && opts.forceSpecialKeyboard
            ? true
            : ch === "$BACKSPACE"
            ? this.forceSpecialKeyboard
            : false;
        this.executeAction(ch, opts);
      } else {
        this.xword.enterChar(ch, this.opts.navigation.autoSkipFilledCells);
      }

      // Bring Up keyboard if afterImage is soecial
      this.specialKeyboard(this.forceSpecialKeyboard);

      this.saveProgress();
    },
    executeAction(actn, opts) {
      switch (actn) {
        case "$ARROWLEFT":
          this.xword.move({ r: 0, c: -1 });
          break;
        case "$ARROWRIGHT":
          this.xword.move({ r: 0, c: 1 });
          break;
        case "$ARROWDOWN":
          this.xword.move({ r: 1, c: 0 });
          break;
        case "$ARROWUP":
          this.xword.move({ r: -1, c: 0 });
          break;
        case "$SWITCHDIRECTION":
          this.xword.isHoriz = !this.xword.isHoriz;
          break;
        case "$SETDIRECTION":
          this.xword.isHoriz = opts.direction;
          break;
        case "$TAB":
          this.xword.moveClue(true);
          break;
        case "$!TAB":
          this.xword.moveClue(false);
          break;
        case "$SETPOSITION":
          this.xword.setPosition(opts.r, opts.c);
          break;
        case "$FLAGCELL":
          this.xword.toggleCellFlag();
          break;
        case "$REMOVESPECIALINPUT":
          // Only removes it if just created
          if (this.xword.getCell().isSpecialInput) {
            this.xword.specialInputIntegrity();
          }
          break;
        case "$LEAVESPECIALINPUT":
          if (this.xword.getCell().isSpecialInput) {
            this.xword.incrementPosition(false);
          } else {
            this.executePress("$TAB");
          }
          break;
        case "$SPECIALEDIT":
          this.xword.enableSpecialEdit();
          break;
        case "$TOGGLESHOWCONTEXT":
          this.clickedClue = this.xword[opts.direction][opts.number];
          this.contextEnabled = !this.clickedClue.showContext;
          this.clickedClue.showContext = this.contextEnabled;
          break;
        case "$BACKSPACE":
          this.xword.backSpaceLogic();
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#crossword {
  .blk-container {
    max-width: 500px;
    width: 100%;
  }
}
</style>
