<template>
  <div class="clues">
    <div class="clue-h icn" @click="showClues = !showClues">
      {{ clueHead }}&nbsp;({{ relevantClueCount() }})
      <i
        :class="{
          fas: true,
          'fa-angle-down': !showClues,
          'fa-angle-up': showClues,
        }"
      ></i>
    </div>
    <div class="clue-list" v-if="showClues">
      <div
        v-for="(clue, num) in clueObj"
        :class="['clue', { active: isActive(num) }]"
        :key="clue.id"
      >
        <div v-if="showClue(clue)">
          <div class="clue-num-txt">
            <div>{{ num }}.</div>
            <div
              class="clue-txt"
              @click="
                $emit('executePress', '$TOGGLESHOWCONTEXT', {
                  direction: direction,
                  number: num,
                })
              "
            >
              {{ clue.txt }}
            </div>
          </div>
          <xword-clue-context
            v-if="
              contextOpt === 'always' ||
              (contextOpt === 'toggle' && clue.showContext)
            "
            :context="clue.ctx"
            :xr="r"
            :xc="c"
            :xAcrossNum="acrossNum"
            :xDownNum="downNum"
            :xIsHoriz="puzzleIsHoriz"
            :curCellValue="curCellValue"
            :curCellFlag="curCellFlag"
            :showContextKey="showContextKey"
            :showErrors="showErrors"
            @contextClick="contextClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import XwordClueContext from "@/components/crossword/XwordClueContext.vue";
export default {
  name: "XwordClues",
  components: {
    XwordClueContext,
  },
  props: {
    clueObj: Object,
    r: Number,
    c: Number,
    acrossNum: Number,
    downNum: Number,
    direction: String,
    curCellValue: String,
    contextOpt: String,
    hideClueOpt: String,
    showContextKey: String,
    curCellFlag: Boolean,
    puzzleIsHoriz: Boolean,
    showErrors: Boolean,
  },
  data() {
    return {
      showClues: false,
    };
  },
  computed: {
    clueHead() {
      return this.direction.charAt(0).toUpperCase() + this.direction.slice(1);
    },
  },
  methods: {
    isActive(num) {
      return this.puzzleIsHoriz
        ? this.direction === "across" && this.acrossNum == num
        : this.direction === "down" && this.downNum == num;
    },
    contextClick(r, c) {
      this.$emit("executePress", "$SETPOSITION", {
        r: r,
        c: c,
        forceSpecialKeyboard: true,
      });
      this.$emit("executePress", "$SETDIRECTION", {
        direction: this.direction === "across",
        forceSpecialKeyboard: true,
      });
    },
    showClue(clue) {
      let ret = this.hideClueOpt === "never";
      ret = ret || (this.hideClueOpt === "onFill" && !clue.filled);
      ret = ret || (this.hideClueOpt === "onCorrect" && !clue.correct);
      return ret;
    },
    relevantClueCount() {
      let numClues = Object.keys(this.clueObj).length;
      let ret = numClues.toString() + " total";
      if (this.hideClueOpt != "never") {
        let cnt = 0;
        let suffix = " filled";
        if (this.hideClueOpt === "onFill") {
          for (let k of Object.keys(this.clueObj)) {
            cnt += this.clueObj[k].filled ? 1 : 0;
          }
        } else if (this.hideClueOpt == "onCorrect") {
          for (let k of Object.keys(this.clueObj)) {
            cnt += this.clueObj[k].correct ? 1 : 0;
          }
          suffix = " correct";
        }
        ret = cnt.toString() + "/" + numClues.toString() + suffix;
      }
      return ret;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
.clues {
  text-align: left;
  max-width: 650px;
  .clue-h {
    text-align: center;
    font-size: 17px;
    margin-bottom: 0px;
  }
  .clue-list {
    width: calc(100% - 50px);
    margin-left: 50px;
    ol {
      font-size: 18px;
      font-weight: bold;
      .clue {
        .clue-txt {
          font-size: 16px;
          font-weight: normal;
          cursor: pointer;
        }
      }
    }
  }
  .clue-num-txt {
    display: flex;
    gap: 5px;
    div:first-of-type {
      font-weight: bold;
    }
  }
}
</style>
