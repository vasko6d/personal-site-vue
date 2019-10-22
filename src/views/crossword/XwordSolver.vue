<template>
  <div id="crossword">
    <div class="blk-container">
      <div style="height: 0; overflow: hidden;">
        <input
          type="text"
          ref="psuedo-input"
          style="opacity: 0;"
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
      <xword-current-clue :clue="currentClue" @executePress="executePress" />
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
import Xword from "@/components/crossword//Xword.js";

// Xword Data Source Imports
import Xword1 from "@/assets/xword/Xword1.vue";
import Xword2 from "@/assets/xword/Xword2.vue";
import Xword3 from "@/assets/xword/Xword3.vue";
import Xword4 from "@/assets/xword/Xword4.vue";
import Xword5 from "@/assets/xword/Xword5.vue";
import Xword6 from "@/assets/xword/Xword6.vue";

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
    XwordHeader
  },
  props: {
    xwordId: String
  },
  data() {
    return {
      opts: this.defaultOpts(),
      showOptions: false,
      showHelp: false,
      showTools: false,
      rawXwords: {
        1: Xword1.data().xword,
        2: Xword2.data().xword,
        3: Xword3.data().xword,
        4: Xword4.data().xword,
        5: Xword5.data().xword,
        6: Xword6.data().xword
      },
      xword: new Xword("", "", "", "", [], {}, {}),
      clickedClue: {}, // hacky to make clue context togglable....
      contextEnabled: false,
      forceSpecialKeyboard: false,
      keyboardMasterOverride: false
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
        isAcross: isAcross
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
    }
  },
  mounted() {
    let raw = this.rawXwords[this.xwordId];
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
    if (localStorage["xword:" + this.xwordId.toString()]) {
      let progress = JSON.parse(
        localStorage["xword:" + this.xwordId.toString()]
      );
      this.xword.reloadSavedData(progress);
    }
    if (localStorage["xwordOpts"]) {
      let cachedOpts = JSON.parse(localStorage["xwordOpts"]);

      // To prevent stale opts in localStorage assign current opts with falues from cached ones
      this.opts.clues.showCluePanel = cachedOpts.clues.showCluePanel;
      this.opts.clues.contextOpt = cachedOpts.clues.contextOpt;
      this.opts.clues.hideClueOpt = cachedOpts.clues.hideClueOpt;
      this.opts.errors.showErrors = cachedOpts.errors.showErrors;
      this.opts.keyboard.showOnPageKeyboard =
        cachedOpts.keyboard.showOnPageKeyboard;
      this.opts.keyboard.enableNativeKeyboardToggle =
        cachedOpts.keyboard.enableNativeKeyboardToggle;
      this.opts.navigation.autoSkipFilledCells =
        cachedOpts.navigation.autoSkipFilledCells;
    }
    console.log(this.xword);
  },
  methods: {
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
    saveProgress() {
      localStorage["xword:" + this.xwordId.toString()] = JSON.stringify(
        this.xword.saveData()
      );
      //console.log("Progress saved for [" + this.xword.title + "]");
    },
    defaultOpts(save = false) {
      let ret = {
        clues: {
          showCluePanel: true,
          contextOpt: "always",
          contextOpts: [
            { name: "Always show clue context", val: "always" },
            { name: "Click clue to toggle context", val: "toggle" },
            { name: "Never show clue context", val: "never" }
          ],
          hideClueOpt: "never",
          hideClueOpts: [
            {
              name: "Hide clues that are CORRECT and filled",
              val: "onCorrect"
            },
            { name: "Hide clues that are filled", val: "onFill" },
            { name: "Never hide clues", val: "never" }
          ]
        },
        keyboard: {
          showOnPageKeyboard: true,
          enableNativeKeyboardToggle: false
        },
        errors: {
          showErrors: false
        },
        navigation: {
          autoSkipFilledCells: true
        }
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
      localStorage["xwordOpts"] = JSON.stringify(this.opts);
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
          this.backSpaceLogic();
          break;
      }
    },
    backSpaceLogic() {
      // if the original cell was empty move then do it again
      let cell = this.xword.getCell();
      const move = !cell.entry || cell.wasAutoSolved;
      if (move) {
        if (this.xword.isHoriz) {
          this.xword.move({ r: 0, c: -1 });
        } else {
          this.xword.move({ r: -1, c: 0 });
        }
      }
      cell = this.xword.getCell();
      if (!cell.wasAutoSolved) {
        if (cell.isSpecialInput) {
          // If its special input simply elete end character
          if (cell.entry && !move) {
            cell.entry = cell.entry.slice(0, -1);
          }
        } else {
          this.xword.getCell().entry = "";
        }
        this.xword.bulkUpdateClueFlags();
      }
    }
  }
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
