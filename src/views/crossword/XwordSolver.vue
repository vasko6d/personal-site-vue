<template>
  <div id="crossword">
    <div class="blk-container">
      <div class="x-head">
        <h2>{{ xword.title }}</h2>
        by {{ xword.author }}, {{ xword.publishDate.toDateString() }}
        &nbsp;
        <i class="fas fa-question-circle" @click="showHelp = true"></i>
        <i class="fas fa-cog" @click="showOptions = true"></i>
      </div>
      <xword-puzzle
        :puzzle="xword.puzzle"
        :r="xword.r"
        :c="xword.c"
        :isHoriz="xword.isHoriz"
        :acrossNum="acrossNum"
        :downNum="downNum"
        @executePress="executePress"
      />
      <xword-current-clue :clue="currentClue" @executePress="executePress" />
      <xword-keyboard @executePress="executePress" />
      <xword-clue-panel
        :acrossClueObj="xword.across"
        :downClueObj="xword.down"
        :filledObj="xword.filled"
        :r="xword.r"
        :c="xword.c"
        :acrossNum="acrossNum"
        :downNum="downNum"
        :puzzleIsHoriz="xword.isHoriz"
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
import Xword from "@/components/crossword//Xword.js";

// Xword Data Source Imports
import Xword1 from "@/assets/xword/Xword1.vue";
import Xword2 from "@/assets/xword/Xword2.vue";

export default {
  name: "crossword",
  components: {
    XwordCluePanel,
    XwordPuzzle,
    XwordCurrentClue,
    XwordKeyboard
  },
  props: {
    xwordId: String
  },
  data() {
    return {
      showAcross: false,
      showDown: false,
      showOptions: false,
      showHelp: false,
      rawXwords: {
        1: Xword1.data().xword,
        2: Xword2.data().xword
      },
      xword: new Xword("", "", "", "", [], {}, {})
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
    console.log(this.xword);
  },
  methods: {
    executePress(ch, opts) {
      console.log("executePress: ", ch, ", Options: ", opts);

      //The cell before any moving occurs
      let beforeImage = this.xword.getCell();

      // All press/action handler
      if (ch.startsWith("$")) {
        this.executeAction(ch, opts);
      } else {
        this.$set(beforeImage, "entry", ch);
        this.xword.incrementPosition();
      }

      // The cell after moving occurs
      let afterImage = this.xword.getCell();

      // Update relevant contexts
      this.updateContexts([beforeImage, afterImage]);

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
          this.xword.r = opts.r;
          this.xword.c = opts.c;
          break;
        case "$BACKSPACE":
          if (!this.xword.getCell().entry) {
            if (this.xword.isHoriz) {
              this.xword.move({ r: 0, c: -1 });
            } else {
              this.xword.move({ r: -1, c: 0 });
            }
          }
          this.xword.getCell().entry = "";
          this.xword.updateFilled();
          break;
      }
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
      for (const aNum of acrossToUpdate) {
        this.xword.across[aNum].ctx = this.xword.getFullClueContext(
          this.xword.across,
          aNum,
          true
        );
      }
      for (const dNum of downToUpdate) {
        this.xword.down[dNum].ctx = this.xword.getFullClueContext(
          this.xword.down,
          dNum,
          false
        );
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
    .x-head {
      i {
        margin-right: 0.25em;
      }
    }
  }
}
</style>
