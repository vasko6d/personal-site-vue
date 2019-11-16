<template>
  <div id="current-clue">
    <div class="clue-flex">
      <i
        class="fas fa-caret-left bg1-hvr bg1-txt-hvr"
        @click="moveClue(false)"
      ></i>
      <div class="clue-body bg1-hvr bg1-txt-hvr" @click="switchDirection">
        {{ clue.num }} - {{ clue.isAcross ? "Across" : "Down" }}&nbsp;
        <div class="indent">{{ clue.txt }}</div>
      </div>
      <i
        class="fas fa-caret-right bg1-hvr bg1-txt-hvr"
        @click="moveClue(true)"
      ></i>
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
      if (forward) {
        this.$emit("executePress", "$TAB");
      } else {
        this.$emit("executePress", "$!TAB");
      }
    },
    switchDirection() {
      this.$emit("executePress", "$SWITCHDIRECTION");
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
.pink {
  @import "@/assets/styles/pink-theme.scss";
}
#current-clue {
  .clue-flex {
    display: flex;

    i {
      user-select: none;
      display: flex;
      min-width: 50px;
      flex-direction: column;
      justify-content: center;
      border-radius: 0.35em;
    }
    .clue-body {
      flex-grow: 1;
      text-align: left;
      height: 5em;
      overflow-y: auto;
      padding-left: 0.5em;
      padding-right: 0.1em;
      border-radius: 0.35em;
      .indent {
        margin-left: 1em;
      }
    }
  }
  margin-bottom: 0.5em;
}
</style>
