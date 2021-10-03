<template>
  <div class="clue-ctx">
    <div class="c-wrap">
      <div class="p-row">
        <div
          class="p-cell"
          v-for="cell in context"
          :key="cell.id"
          @click="clickFxn(cell.r, cell.c)"
          v-tooltip="{
            content: cell.entry + flashDash,
            show: isExact(cell.r, cell.c) && cell.isSpecialInput,
            trigger: 'manual',
          }"
        >
          <div class="color-base" :class="[cell.color]">
            <div
              :class="[
                {
                  flagged: cell.flag,
                  autosolved: cell.wasAutoSolved,
                  wrong: showErrors && cell.wrong && cell.entry,
                },
              ]"
            >
              <div
                :class="[
                  {
                    active: isActive(cell.acrossNum, cell.downNum),
                    exact: isExact(cell.r, cell.c),
                  },
                ]"
              >
                <div class="cell-wrapper">
                  <span class="numbering">{{ cell.cellNum }}</span>
                  <div class="entry">
                    <span v-if="!cell.isSpecialInput">{{ cell.entry }}</span>
                    <i v-else class="fas fa-comment-dots"></i>
                  </div>
                  <div class="circle" v-show="cell.shape === 'circle'"></div>
                </div>
              </div>
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
    showErrors: Boolean,
  },
  data() {
    return {
      halfSecs: 0,
    };
  },
  computed: {
    flashDash() {
      return this.halfSecs % 2 === 0 ? "_" : "&nbsp;";
    },
  },
  mounted() {
    setInterval(() => {
      this.halfSecs = (this.halfSecs + 1) % 100;
    }, 500);
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
    },
  },
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
      .white,
      .gray {
        .cell-wrapper {
          .entry {
            font-size: 75%;
            transform: translatex(35%) translatey(-15%);
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
