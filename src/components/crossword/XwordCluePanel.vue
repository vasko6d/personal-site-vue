<template>
  <div id="clue-panel">
    <div id="clue-head">
      Clue Panel&nbsp;
      <i class="fas fa-cog"></i>
    </div>
    <xword-clues
      :clueObj="acrossClueObj"
      :filledCount="filledObj.across"
      :r="r"
      :c="c"
      :acrossNum="acrossNum"
      :downNum="downNum"
      :curCellValue="curCellValue"
      direction="across"
      :puzzleIsHoriz="puzzleIsHoriz"
      :showClueContext="showClueContext"
      :showFilled="showFilled"
      @executePress="executePress"
    />
    <xword-clues
      :clueObj="downClueObj"
      :filledCount="filledObj.down"
      :r="r"
      :c="c"
      :acrossNum="acrossNum"
      :downNum="downNum"
      :curCellValue="curCellValue"
      direction="down"
      :puzzleIsHoriz="puzzleIsHoriz"
      :showClueContext="showClueContext"
      :showFilled="showFilled"
      @executePress="executePress"
    />
  </div>
</template>

<script>
import XwordClues from "@/components/crossword/XwordClues.vue";
export default {
  components: {
    XwordClues
  },
  props: {
    acrossClueObj: Object,
    downClueObj: Object,
    filledObj: Object,
    r: Number,
    c: Number,
    curCellValue: String,
    acrossNum: Number,
    downNum: Number,
    puzzleIsHoriz: Boolean
  },
  data() {
    return {
      showClueContext: true,
      showFilled: false
    };
  },
  methods: {
    executePress(ch, opts) {
      this.$emit("executePress", ch, opts);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/light-theme.scss";
}
#clue-panel {
  border-radius: 0.35em;
  #clue-head {
    font-weight: bold;
    font-size: 17px;
    i {
      cursor: pointer;
    }
  }
}
</style>
