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
              active: isActive(cell),
              exact: isExact(r, c),
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
                wrong: calcWrong(cell),
                autosolved: cell.wasAutoSolved
              }
            ]"
            v-tooltip="{
              content: cell.entry + flashDash,
              show: isExact(r, c) && cell.isSpecialInput,
              trigger: 'manual'
            }"
          >
            <span class="numbering">{{ cell.cellNum }}</span>
            <div class="entry">
              <span v-if="!cell.isSpecialInput">{{ cell.entry }}</span>
              <i v-else class="fas fa-comment-dots"></i>
            </div>
          </div>
          <div class="circle" v-show="cell.shape === 'circle'"></div>
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
    downNum: Number,
    showErrors: Boolean
  },
  data() {
    return {
      halfSecs: 0
    };
  },
  computed: {
    flashDash() {
      return this.halfSecs % 2 === 0 ? "_" : "&nbsp";
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.halfSecs = (this.halfSecs + 1) % 100;
    }, 500);
  },
  methods: {
    isInput(color) {
      return color != "black";
    },
    isSpecialInput(entry) {
      return entry && !entry.match(/^[A-Z]$/);
    },
    isActive(cell) {
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
    },
    calcWrong(cell) {
      // this is the ONE place that shown wrong us updated... dangerous
      let shownWrong = this.showErrors && cell.wrong;
      if (!cell.wasShownWrong && shownWrong) {
        this.$emit("updateShownWrong", cell);
      }
      return shownWrong;
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
