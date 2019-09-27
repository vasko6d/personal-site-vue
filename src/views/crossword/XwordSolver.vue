<template>
  <div id="crossword">
    <div class="blk-container">
      <div>
        <h2>{{ xword.title }}</h2>
        by {{ xword.author }}, {{ xword.publishDate }}
      </div>
      <xword-puzzle :xword="xword" />
      <xword-keyboard @executePress="executePress" />
      <xword-clue-panel :xword="xword" />
    </div>
  </div>
</template>

<script>
import XwordPuzzle from "@/components/crossword/XwordPuzzle.vue";
import XwordCluePanel from "@/components/crossword/XwordCluePanel.vue";
import XwordKeyboard from "@/components/crossword/XwordKeyboard.vue";
import Xword from "@/components/crossword//Xword.js";

// Xword Data Source Imports
import Xword1 from "@/assets/xword/Xword1.vue";

export default {
  name: "crossword",
  components: {
    XwordCluePanel,
    XwordPuzzle,
    XwordKeyboard
  },
  data() {
    return {
      showAcross: false,
      showDown: false,
      rawXwords: {
        1: Xword1.data().xword
      },
      xword: new Xword("", "", "", "", [], {}, {}),
      xwordId: 1
    };
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
    console.log("xword:", this.xword["across"]);
  },
  methods: {
    executePress(ch) {
      console.log("executePress: ", ch);
      this.$set(this.xword.getCell(), "entry", ch);
      if (ch) {
        console.log("incrementPosition");
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
