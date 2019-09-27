<template>
  <div id="current-clue">
    <div>{{ clue.isAcross ? "Across" : "Down" }}</div>
    <div class="indent">{{ clue.num }}: {{ clue.txt }}</div>
  </div>
</template>

<script>
export default {
  props: {
    clue: Object
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/blue-theme.scss";
#current-clue {
  background-color: rgba(lighten($nav-bg, 10%), 0.7);
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
