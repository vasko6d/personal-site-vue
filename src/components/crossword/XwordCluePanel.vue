<template>
  <div id="clue-panel" class="bg1">
    <div id="clue-head">Clue Panel</div>
    <xword-clues
      :clueObj="acrossClueObj"
      :r="r"
      :c="c"
      :acrossNum="acrossNum"
      :downNum="downNum"
      :curCellValue="curCellValue"
      :showContextKey="showContextKey"
      :curCellFlag="curCellFlag"
      direction="across"
      :puzzleIsHoriz="puzzleIsHoriz"
      :contextOpt="opts.clues.contextOpt"
      :hideClueOpt="opts.clues.hideClueOpt"
      :showErrors="opts.errors.showErrors"
      @executePress="executePress"
    />
    <xword-clues
      :clueObj="downClueObj"
      :r="r"
      :c="c"
      :acrossNum="acrossNum"
      :downNum="downNum"
      :curCellValue="curCellValue"
      :showContextKey="showContextKey"
      :curCellFlag="curCellFlag"
      direction="down"
      :puzzleIsHoriz="puzzleIsHoriz"
      :contextOpt="opts.clues.contextOpt"
      :hideClueOpt="opts.clues.hideClueOpt"
      :showErrors="opts.errors.showErrors"
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
    opts: Object,
    r: Number,
    c: Number,
    acrossNum: Number,
    downNum: Number,
    curCellValue: String,
    showContextKey: String,
    curCellFlag: Boolean,
    puzzleIsHoriz: Boolean
  },
  methods: {
    executePress(ch, opts) {
      this.$emit("executePress", ch, opts);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
#clue-panel {
  #clue-head {
    font-weight: bold;
    font-size: 17px;
  }
}
</style>
