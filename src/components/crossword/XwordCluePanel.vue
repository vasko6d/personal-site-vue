<template>
  <div id="clue-panel">
    <div id="clue-head">
      Clue Panel&nbsp;
      <i class="fas fa-cog"></i>
    </div>
    <xword-clues
      :xword="xword"
      direction="across"
      :showClueContext="showClueContext"
      :showFilled="showFilled"
    />
    <xword-clues
      :xword="xword"
      direction="down"
      :showClueContext="showClueContext"
      :showFilled="showFilled"
    />
  </div>
</template>

<script>
import XwordClues from "@/components/crossword/XwordClues.vue";
import Xword from "@/components/crossword//Xword.js";
export default {
  components: {
    XwordClues
  },
  props: {
    xword: Xword
  },
  data() {
    return {
      showClueContext: true,
      showFilled: false
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/blue-theme.scss";
#clue-panel {
  background-color: rgba(lighten($nav-bg, 10%), 0.7);
  border-radius: 0.35em;
  #clue-head {
    font-weight: bold;
    font-size: 17px;
    i {
      cursor: pointer;
      color: darken($nav-txt, 10%);
      &:hover {
        color: $nav-txt;
      }
    }
  }
}
</style>
