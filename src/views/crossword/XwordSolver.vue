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
        @flagCell="executePress('$FLAGCELL')"
        @specialEdit="executePress('$SPECIALEDIT')"
        @setOption="setOption"
        @defaultSettings="opts = defaultOpts()"
        @clear="clear"
        :opts="opts"
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
      />
      <xword-current-clue :clue="currentClue" @executePress="executePress" />
      <xword-keyboard
        v-show="opts.keyboard.showOnPageKeyboard"
        @executePress="executePress"
      />
      <xword-clue-panel
        v-if="opts.clues.showCluePanel"
        :acrossClueObj="xword.across"
        :downClueObj="xword.down"
        :filledObj="xword.filled"
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

export default {
  name: "crossword",
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
        3: Xword3.data().xword
      },
      xword: new Xword("", "", "", "", [], {}, {}),
      clickedClue: {}, // hacky to make clue context togglable....
      contextEnabled: false
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
        this.contextEnabled
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
      raw.clues.down
    );
    if (localStorage["xword:" + this.xwordId.toString()]) {
      let progress = JSON.parse(
        localStorage["xword:" + this.xwordId.toString()]
      );
      this.xword.puzzle = progress;
      this.xword.processClueList(this.xword.across, true);
      this.xword.processClueList(this.xword.down, false);
      this.xword.bulkUpdateFilled();
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
      this.opts.navigation.autoSkipFilledCells =
        cachedOpts.navigation.autoSkipFilledCells;
    }
    console.log(this.xword);
  },
  methods: {
    clear(clearType) {
      let raw = this.rawXwords[this.xwordId];
      switch (clearType) {
        case "puzzle":
          this.xword = new Xword(
            raw.title,
            raw.author,
            raw.editor,
            raw.createDate,
            raw.solution,
            raw.clues.across,
            raw.clues.down
          );
          break;
        case "flags":
          this.xword.clear(true, false);
          break;
        case "wrong":
          this.xword.clear(false, true);
          break;
        case "clue":
          this.xword.clearClue();
          this.updateContexts([this.xword.getCell()]);
          break;
      }

      // Save Progress
      localStorage["xword:" + this.xwordId.toString()] = JSON.stringify(
        this.xword.puzzle
      );
    },
    defaultOpts() {
      return {
        clues: {
          showCluePanel: true,
          contextOpt: "always",
          contextOpts: [
            { name: "Always show clue context", val: "always" },
            { name: "Click clue to toggle context", val: "toggle" },
            { name: "Never show clue context", val: "never" }
          ],
          hideClueOpt: "onFill",
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
          showOnPageKeyboard: true
        },
        errors: {
          showErrors: true
        },
        navigation: {
          autoSkipFilledCells: true
        }
      };
    },
    setOption(p) {
      let opt = this.opts;
      for (let i = 0; i < p.optionPath.length - 1; i++) {
        opt = opt[p.optionPath[i]];
      }
      opt[p.optionPath[p.optionPath.length - 1]] = p.value;
      localStorage["xwordOpts"] = JSON.stringify(this.opts);
    },
    specialKeyboard() {
      if (this.xword.getCell().isSpecialInput) {
        //console.log("...bringing up special edit keyboard");
        this.$refs["psuedo-input"].focus();
      } else {
        //console.log("...hiding up special edit keyboard");
        this.$refs["psuedo-input"].blur();
      }
    },
    executePress(ch, opts) {
      console.log("executePress: ", ch, ", Options: ", opts);

      // All press/action handler
      if (ch.startsWith("$")) {
        this.executeAction(ch, opts);
      } else {
        this.xword.enterChar(ch);
      }

      // Bring Up keyboard if afterImage is soecial
      this.specialKeyboard();

      // Save Progress
      localStorage["xword:" + this.xwordId.toString()] = JSON.stringify(
        this.xword.puzzle
      );
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
            this.xword.incrementPosition();
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
      const moved = !this.xword.getCell().entry;
      if (moved) {
        if (this.xword.isHoriz) {
          this.xword.move({ r: 0, c: -1 });
        } else {
          this.xword.move({ r: -1, c: 0 });
        }
      }
      let cell = this.xword.getCell();
      if (cell.isSpecialInput) {
        // If its special input simply elete end character
        if (cell.entry && !moved) {
          cell.entry = cell.entry.slice(0, -1);
        }
      } else {
        this.xword.getCell().entry = "";
      }
      this.xword.updateFilled();
    },
    updateContexts(xCells) {
      // figure out how many clues need updated contexts
      let acrossToUpdate = new Set();
      let downToUpdate = new Set();
      for (const xcell of xCells) {
        for (const el of this.xword.across[xcell.acrossNum].ctx) {
          acrossToUpdate.add(el.acrossNum);
          downToUpdate.add(el.downNum);
        }
      }

      // Actually update the contexts
      this.xword.updateContexts(acrossToUpdate, downToUpdate);
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
