<template>
  <div class="clues">
    <div class="clue-h" @click="showClues = !showClues">
      {{ clueHead }}&nbsp;({{ filledCount }}/{{ Object.keys(clueObj).length }})
      <i
        :class="{
          fas: true,
          'fa-angle-down': !showClues,
          'fa-angle-up': showClues
        }"
      ></i>
    </div>
    <div class="clue-list">
      <ol v-show="showClues">
        <li
          v-for="(clue, num) in clueObj"
          :value="num"
          :class="['clue', { active: isActive(num) }]"
          :key="clue.id"
          v-show="!clue.filled"
        >
          <span class="clue-txt">{{ clue.txt }}</span>
          <xword-clue-context
            :context="clue.ctx"
            :xr="r"
            :xc="c"
            :xAcrossNum="acrossNum"
            :xDownNum="downNum"
            :xIsHoriz="puzzleIsHoriz"
            :curCellValue="curCellValue"
            :curCellFlag="curCellFlag"
            @contextClick="contextClick"
          />
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import XwordClueContext from "@/components/crossword/XwordClueContext.vue";
export default {
  name: "XwordClues",
  components: {
    XwordClueContext
  },
  props: {
    clueObj: Object,
    filledCount: Number,
    r: Number,
    c: Number,
    acrossNum: Number,
    downNum: Number,
    direction: String,
    curCellValue: String,
    curCellFlag: Boolean,
    puzzleIsHoriz: Boolean,
    showClueContext: Boolean,
    showFilled: Boolean
  },
  data() {
    return {
      showClues: false
    };
  },
  computed: {
    clueHead() {
      return this.direction.charAt(0).toUpperCase() + this.direction.slice(1);
    }
  },
  methods: {
    isActive(num) {
      return this.puzzleIsHoriz
        ? this.direction === "across" && this.acrossNum == num
        : this.direction === "down" && this.downNum == num;
    },
    contextClick(r, c) {
      this.$emit("executePress", "$SETPOSITION", { r: r, c: c });
      this.$emit("executePress", "$SETDIRECTION", {
        direction: this.direction === "across"
      });
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
.clues {
  text-align: left;
  max-width: 650px;
  .clue-h {
    text-align: center;
    font-size: 17px;
    cursor: pointer;
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
}
</style>
