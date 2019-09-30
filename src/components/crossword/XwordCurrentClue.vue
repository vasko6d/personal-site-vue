<template>
  <div id="current-clue">
    <div class="clue-flex">
      <i class="fas fa-caret-left" @click="moveClue(false)"></i>
      <div class="clue-body" @click="switchDirection">
        {{ clue.num }} - {{ clue.isAcross ? "Across" : "Down" }}&nbsp;
        <div class="indent">{{ clue.txt }}</div>
      </div>
      <i class="fas fa-caret-right" @click="moveClue(true)"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    clue: Object
  },
  methods: {
    moveClue(forward) {
      this.$emit("moveClue", forward);
    },
    switchDirection() {
      this.$emit("switchDirection");
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
#current-clue {
  .clue-flex {
    display: flex;

    i {
      user-select: none;
      display: flex;
      min-width: 40px;
      flex-direction: column;
      justify-content: center;
      border-radius: 0.35em;
    }
    .clue-body {
      flex-grow: 1;
      text-align: left;
      min-height: 10px;
      padding-left: 0.5em;
      border-radius: 0.35em;
      .indent {
        margin-left: 1em;
      }
    }
  }
  margin-bottom: 0.5em;
}
</style>
