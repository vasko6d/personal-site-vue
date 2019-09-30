<template>
  <div class="clue-ctx">
    <div class="p-row">
      <div
        class="p-cell"
        v-for="ctx in context"
        :key="ctx.id"
        @click="clickFxn(ctx[0], ctx[1], xword.puzzle[ctx[0]][ctx[1]].color)"
      >
        <div
          :class="[
            xword.puzzle[ctx[0]][ctx[1]].color,
            {
              input: isInput(xword.puzzle[ctx[0]][ctx[1]].color),
              active: isActive(xword.puzzle[ctx[0]][ctx[1]]),
              exact: isExact(ctx[0], ctx[1])
            }
          ]"
        >
          <div class="cell-wrapper">
            <span class="numbering">
              {{ xword.puzzle[ctx[0]][ctx[1]].cellNum }}
            </span>
            <span class="entry">{{ xword.puzzle[ctx[0]][ctx[1]].entry }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Xword from "@/components/crossword//Xword.js";
export default {
  props: {
    xword: Xword,
    context: Array
  },
  methods: {
    isInput(color) {
      return color != "black";
    },
    isActive(cell) {
      let xCell = this.xword.getCell();
      return this.xword.isHoriz
        ? xCell.acrossNum === cell.acrossNum
        : xCell.downNum === cell.downNum;
    },
    isExact(r, c) {
      return r === this.xword.r && c == this.xword.c;
    },
    clickFxn(r, c, color) {
      if (this.isInput(color)) {
        this.xword.r = r;
        this.xword.c = c;
      }
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
      max-width: 4ch;
      .black,
      .white {
        .cell-wrapper {
          .numbering {
            font-size: calc(12px + 0.2vw);
          }
          .entry {
            font-size: calc(20px + 0.2vw);
          }
        }
      }
    }
  }
  margin-bottom: 0.5em;
}
</style>
