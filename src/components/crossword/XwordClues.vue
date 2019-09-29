<template>
  <div class="clues">
    <div class="clue-h" @click="showClues = !showClues">
      {{ clueHead }}&nbsp;({{ filled }}/{{
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
          :key="num"
        >
          <span class="clue-txt" @click="jumpTo(direction, num)">{{
            clue.txt
          }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import Xword from "./Xword.js";
export default {
  name: "XwordClues",
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
    },
    filled() {
      let cnt = 0;
      for (const c of Object.values(this.xword[this.direction])) {
        if (c.filled) {
          cnt++;
        }
      }
      return cnt;
    }
  },
  methods: {
    jumpTo(title, num) {
      console.log("Jump to " + title + "-" + num);
    },
    isActive(num, direction) {
      let cell = this.xword.getCell();
      return this.xword.isHoriz
        ? direction === "across" && cell.acrossNum == num
        : direction === "down" && cell.downNum == num;
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
