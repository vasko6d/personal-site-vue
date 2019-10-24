<template>
  <div class="clue-ctx">
    <div class="c-wrap">
      <div class="p-row">
        <div
          class="p-cell"
          v-for="cell in context"
          :key="cell.id"
          @click="clickFxn(cell.r, cell.c)"
        >
          <div
            :class="[
              cell.color,
              {
                input: cell.isInput,
                active: isActive(cell.acrossNum, cell.downNum),
                exact: isExact(cell.r, cell.c),
                flagged: cell.flag,
                'autosolved-border': cell.wasAutoSolved,
                'wrong-border': showErrors && cell.wrong
              }
            ]"
          >
            <div
              :class="[
                'cell-wrapper',
                {
                  wrong: showErrors && cell.wrong,
                  autosolved: cell.wasAutoSolved
                }
              ]"
            >
              <span class="entry">{{ cell.entry }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    context: Array,
    xr: Number,
    xc: Number,
    xAcrossNum: Number,
    xDownNum: Number,
    xIsHoriz: Boolean,
    curCellFlag: Boolean,
    curCellValue: String,
    showContextKey: String,
    showErrors: Boolean
  },
  methods: {
    clickFxn(r, c) {
      this.$emit("contextClick", r, c);
    },
    isActive(acrossNum, downNum) {
      return this.xIsHoriz
        ? this.xAcrossNum === acrossNum
        : this.xDownNum === downNum;
    },
    isExact(r, c) {
      return this.xr === r && this.xc === c;
    }
  }
};
</script>

<style lang="scss" scoped>
.clue-ctx {
  @import "@/assets/styles/xword-puzzle.scss";
  .p-row {
    .p-cell {
      flex-grow: 1;
      flex-shrink: 1;
      max-width: 3ch;
      .black,
      .white {
        .cell-wrapper {
          .entry {
            font-size: 75%;
            transform: translatex(-50%) translatey(20%);
            overflow: hidden;
          }
        }
      }
    }
    margin-right: 10px;
  }
  margin-bottom: 0.5em;
}
</style>
