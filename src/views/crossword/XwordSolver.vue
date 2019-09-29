<template>
  <div id="crossword">
    <div class="blk-container">
      <div class="x-head">
        <h2>{{ xword.title }}</h2>
        by {{ xword.author }}, {{ xword.publishDate }}
        &nbsp;
        <i class="fas fa-question-circle" @click="showModal = true"></i>
        <i class="fas fa-cog" @click="showModal = true"></i>
      </div>
      <xword-puzzle :xword="xword" @executePress="executePress" />
      <xword-current-clue :clue="currentClue" />
      <xword-keyboard @executePress="executePress" />
      <xword-clue-panel :xword="xword" />
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
      showModal: false,
      rawXwords: {
        1: Xword1.data().xword
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
    }
    console.log(this.xword);
  },
  methods: {
    executePress(ch) {
      console.log("executePress: ", ch);

      if (ch.startsWith("$")) {
        this.executeAction(ch);
      } else {
        this.$set(this.xword.getCell(), "entry", ch);
        this.xword.incrementPosition();
      }

      // Save Progress
      localStorage["xword:" + this.xwordId.toString()] = JSON.stringify(
        this.xword.puzzle
      );
    },
    executeAction(actn) {
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
        case "$TAB":
          this.xword.moveClue(true);
          break;
        case "$!TAB":
          this.xword.moveClue(false);
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
          break;
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
