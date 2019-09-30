<template>
  <div class="clue-ctx">
    <div class="p-row">
      <div
        class="p-cell"
        v-for="ctx in context"
        :key="ctx.id"
        @click="clickFxn(ctx.r, ctx.c, isHoriz)"
      >
        <div
          :class="[
            ctx.color,
            {
              input: ctx.isInput,
              active: ctx.isActive,
              exact: ctx.isExact
            }
          ]"
        >
          <div class="cell-wrapper">
            <span class="numbering">{{ ctx.num }}</span>
            <span class="entry">{{ ctx.entry }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    context: Array,
    isHoriz: Boolean
  },
  methods: {
    clickFxn(r, c, isHoriz) {
      this.$emit("contextClick", r, c, isHoriz);
    }
  }
};
</script>

<style lang="scss" scoped>
.clue-ctx {
  @import "@/assets/styles/xword-puzzle.scss";
  .p-row {
    .p-cell {
      flex-grow: 1;
      flex-shrink: 1;
      max-width: 3ch;
      .black,
      .white {
        .cell-wrapper {
          .numbering {
            font-size: calc(9px + 0.1vw);
          }
          .entry {
            font-size: calc(14px + 0.2vw);
          }
        }
      }
    }
  }
  margin-bottom: 0.5em;
}
</style>
