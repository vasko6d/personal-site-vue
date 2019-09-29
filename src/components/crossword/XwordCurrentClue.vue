<template>
  <div id="current-clue">
    <div>
      <i class="fas fa-caret-square-left" @click="moveClue(false)"></i>
      {{ clue.num }} - {{ clue.isAcross ? "Across" : "Down" }}&nbsp;
      <i class="fas fa-caret-square-right" @click="moveClue(true)"></i>
    </div>
    <div class="indent">{{ clue.txt }}</div>
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
  i {
    cursor: pointer;
  }
  text-align: left;
  border-radius: 0.35em;
  min-height: 10px;
  margin-bottom: 0.5em;
  padding-left: 0.5em;
  .indent {
    margin-left: 1em;
  }
}
</style>
