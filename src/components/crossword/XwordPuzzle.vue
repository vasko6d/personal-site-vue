<template>
  <div id="puzzle">
    <div class="p-row" v-for="row in puzzle" :key="row.id">
      <div class="cell-wrapper" v-for="cell in row" :key="cell.id">
        <div :class="[cell.color, { input: isInput(cell.color) }]">
          <span class="numbering">{{ cell.cellNum }}</span>
          <span class="entry">{{ cell.entry }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    puzzle: Array
  },
  data() {
    return {
      horizOrVert: true,
      curCol: 0,
      curRow: 0
    };
  },
  computed: {
    isHoriz() {
      return this.horizOrVert;
    },
    isVert() {
      return !this.horizOrVert;
    }
  },
  methods: {
    isInput(color) {
      return color != "black";
    }
  }
};
</script>

<style lang="scss" scoped>
#puzzle {
  max-width: 650px;
  .p-row {
    display: flex;
    justify-content: center;
    .cell-wrapper {
      text-align: center;
      display: block;
      float: left;
      position: relative;
      min-width: 3ch;
      min-height: 3ch;
      border: 1px solid black;
      .black {
        background-color: black;
        color: white;
      }
      .white {
        background-color: white;
        color: black;
      }
      .black,
      .white {
        width: 100%;
        padding-top: 100%; /* 1:1 Aspect Ratio */
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        .numbering {
          user-select: none;
          position: absolute;
          top: 0;
          left: 0;
          margin-top: -0.65ch;
          margin-left: 0.1ch;
          font-size: 10px;
        }
        .entry {
          position: absolute; // need better zindex and centering
          top: 0;
          left: 25%;
          margin-top: 0.5ch;
        }
      }
    }
  }
}
</style>
