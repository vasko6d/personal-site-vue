<template>
  <div class="clues">
    <div class="clue-h" @click="showClues = !showClues">
      {{ title }}&nbsp;({{ filled }}/{{ Object.keys(clues).length }})
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
        <li :value="num" class="clue" v-for="(clue, num) in clues" :key="num">
          <span class="clue-txt" @click="jumpTo(title, num)">
            {{ clue.txt }}
          </span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: "XwordClues",
  props: {
    clues: Object,
    title: String
  },
  data() {
    return {
      showClues: false
    };
  },
  computed: {
    filled() {
      let cnt = 0;
      for (const c of Object.values(this.clues)) {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.clues {
  text-align: left;
  max-width: 650px;
  .clue-h {
    text-align: center;
    font-weight: bold;
    font-size: 20px;
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
