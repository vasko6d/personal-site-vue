<template>
  <div class="clues">
    <div class="clue-h" @click="showClues = !showClues">
      {{ clueHead }}&nbsp;({{ xword.filledCount(direction) }}/{{
        Object.keys(xword[direction]).length
      }})
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
          :value="num"
          :class="['clue', { active: isActive(num, direction) }]"
          v-for="(clue, num) in xword[direction]"
          :key="clue.id"
          v-show="!clue.filled"
        >
          <span class="clue-txt">{{ clue.txt }}</span>
          <xword-clue-context
            :context="clue.ctx"
            :isHoriz="direction === 'across'"
            @contextClick="contextClick"
          />
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import Xword from "./Xword.js";
import XwordClueContext from "@/components/crossword/XwordClueContext.vue";
export default {
  name: "XwordClues",
  components: {
    XwordClueContext
  },
  props: {
    xword: Xword,
    direction: String,
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
    isActive(num, direction) {
      let cell = this.xword.getCell();
      return this.xword.isHoriz
        ? direction === "across" && cell.acrossNum == num
        : direction === "down" && cell.downNum == num;
    },
    contextClick(r, c, isHoriz) {
      this.xword.r = r;
      this.xword.c = c;
      this.xword.isHoriz = isHoriz;
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
    width: calc(100% - 40px);
    margin-left: 40px;
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
