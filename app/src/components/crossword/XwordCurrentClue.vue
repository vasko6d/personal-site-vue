<script setup lang="ts">
defineProps<{
  clue: { num: number | null; txt: string; isAcross: boolean };
}>();

const emit = defineEmits<{
  executePress: [ch: string, opts?: Record<string, unknown>];
}>();

function moveClue(forward: boolean) {
  emit("executePress", forward ? "$TAB" : "$!TAB");
}
function switchDirection() {
  emit("executePress", "$SWITCHDIRECTION");
}
</script>

<template>
  <div id="current-clue">
    <div class="clue-flex">
      <i class="fas fa-caret-left bg1-hvr bg1-txt-hvr" @click="moveClue(false)"></i>
      <div class="clue-body bg1-hvr bg1-txt-hvr" @click="switchDirection">
        {{ clue.num }} - {{ clue.isAcross ? "Across" : "Down" }}&nbsp;
        <div class="indent">{{ clue.txt }}</div>
      </div>
      <i class="fas fa-caret-right bg1-hvr bg1-txt-hvr" @click="moveClue(true)"></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
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
