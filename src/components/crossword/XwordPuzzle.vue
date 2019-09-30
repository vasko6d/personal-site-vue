<template>
  <div id="puzzle">
    <div class="p-row" v-for="(row, r) in xword.puzzle" :key="row.id">
      <div
        class="p-cell"
        v-for="(cell, c) in row"
        :key="cell.id"
        @click="clickFxn(r, c, cell.color)"
      >
        <div
          :class="[
            cell.color,
            {
              input: isInput(cell.color),
              active: isActive(cell),
              exact: isExact(r, c)
            }
          ]"
        >
          <div class="cell-wrapper">
            <span class="numbering">{{ cell.cellNum }}</span>
            <span class="entry">{{ cell.entry }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    xword: Object
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
        if (this.isExact(r, c)) {
          this.$emit("executePress", "$SWITCHDIRECTION");
        } else {
          this.xword.r = r;
          this.xword.c = c;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#puzzle {
  .p-row {
    display: flex;
    justify-content: center;
    .p-cell {
      flex-grow: 1;
      border: 1px solid black;
      .black {
        background-color: black;
        color: white;
      }
      .white {
        background-color: white;
        border: 2px solid white;
        color: black;
      }
      .active {
        background-color: rgb(255, 255, 152);
        border: 2px solid rgb(255, 255, 152);
        color: black;
      }
      .exact {
        background-color: rgb(158, 240, 255);
        color: black;
        border: 2px solid rgb(18, 219, 255);
      }
      .black,
      .white {
        text-align: center;
        position: relative;
        min-width: 1ch;
        min-height: 1ch;
        .cell-wrapper {
          width: 100%;
          height: 0;
          padding-top: 100%;
          .numbering {
            user-select: none;
            position: absolute;
            top: 0;
            left: 0;
            margin-top: -0.65ch;
            font-size: calc(7px + 0.1vw);
          }
          .entry {
            position: absolute; // need better zindex and centering
            bottom: 0;
            font-size: calc(12px + 0.2vw);
            transform: translatex(-50%) translatey(8%);
          }
        }
      }
    }
  }
  margin-bottom: 0.5em;
}
</style>
