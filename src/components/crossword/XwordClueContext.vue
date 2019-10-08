<template>
  <div class="clue-ctx">
    <div class="c-wrap">
      <div class="p-row">
        <div
          class="p-cell"
          v-for="ctx in context"
          :key="ctx.id"
          @click="clickFxn(ctx.r, ctx.c)"
        >
          <div
            :class="[
              ctx.color,
              {
                input: ctx.isInput,
                active: isActive(ctx.acrossNum, ctx.downNum),
                exact: isExact(ctx.r, ctx.c),
                flagged: ctx.flag
              }
            ]"
          >
            <div
              :class="[
                'cell-wrapper',
                { wrong: showErrors && ctx.entry && ctx.entry != ctx.ans }
              ]"
            >
              <span class="entry">{{ ctx.entry }}</span>
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
