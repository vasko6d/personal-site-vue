<template>
  <div id="puzzle">
    <div class="p-row" v-for="(row, r) in puzzle" :key="row.id">
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
    puzzle: Array,
    r: Number,
    c: Number,
    isHoriz: Boolean,
    acrossNum: Number,
    downNum: Number
  },
  methods: {
    isInput(color) {
      return color != "black";
    },
    isActive(cell) {
      console.log(this.acrossNum, cell.acrossNum);
      return this.isHoriz
        ? this.acrossNum === cell.acrossNum
        : this.downNum === cell.downNum;
    },
    isExact(r, c) {
      return r === this.r && c == this.c;
    },
    clickFxn(r, c, color) {
      if (this.isInput(color)) {
        if (this.isExact(r, c)) {
          this.$emit("executePress", "$SWITCHDIRECTION");
        } else {
          this.$emit("executePress", "$SETPOSITION", { r: r, c: c });
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#puzzle {
  @import "@/assets/styles/xword-puzzle.scss";
  margin-bottom: 0.5em;
}
</style>
