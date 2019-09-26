<template>
  <div id="puzzle">
    <div class="p-row" v-for="row in puzzle" :key="row.id">
      <div class="p-cell" v-for="cell in row" :key="cell.id">
        <div :class="[cell.color, { input: isInput(cell.color) }]">
          <div class="cell-wrapper">
            <span class="numbering">{{ cell.cellNum }}</span>
            <span class="entry">{{ cell.entry }}</span>
          </div>
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
  .p-row {
    display: flex;
    justify-content: center;
    .p-cell {
      flex-grow: 1;
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
        text-align: center;
        position: relative;
        min-width: 1ch;
        min-height: 1ch;
        border: 1px solid black;
        .cell-wrapper {
          width: 100%;
          height: 0;
          padding-top: 100%;
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
  margin-bottom: 0.5em;
}
</style>
