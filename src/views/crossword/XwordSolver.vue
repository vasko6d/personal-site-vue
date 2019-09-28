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
      <xword-puzzle :xword="xword" />
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
  data() {
    return {
      showAcross: false,
      showDown: false,
      showModal: false,
      rawXwords: {
        1: Xword1.data().xword
      },
      xword: new Xword("", "", "", "", [], {}, {}),
      xwordId: 1
    };
  },
  computed: {
    currentClue() {
      let cell = this.xword.getCell();
      let isAcross = this.xword.isHoriz;
      let num = isAcross ? cell.acrossNum : cell.downum;
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
    if (localStorage.xwords && localStorage.xwords[this.xwordId]) {
      this.xword = localStorage.xwords[this.xwordId];
    }
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
        case "$BACKSPACE":
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
