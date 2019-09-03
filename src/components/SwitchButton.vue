<template id="switch-button">
  <div class="switch-button-control">
    <div
      class="switch-button"
      :class="{ enabled: isEnabled }"
      @click="toggle"
      :style="{ '--color': color }"
    >
      <div class="button"></div>
    </div>
    <div class="switch-button-label">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "switch-button",
  model: {
    prop: "isEnabled",
    event: "toggle"
  },
  props: {
    isEnabled: Boolean,
    color: {
      type: String,
      required: false,
      default: "#9dad7f"
    }
  },
  methods: {
    toggle: function() {
      this.$emit("toggle", !this.isEnabled);
    }
  }
};
</script>

<style lang="scss" scoped>
.switch-button-control {
  display: grid;
  justify-content: right;
  grid-template-areas: "sb sbl";

  .switch-button {
    grid-area: sb;
    $switch-button-height: 1.6em;
    $switch-button-color: darken(#9dad7f, 20%);
    $switch-button-border-thickness: 2px;
    $switch-transition: all 0.3s ease-in-out;
    $switch-is-rounded: true;

    height: $switch-button-height;
    width: calc(#{$switch-button-height} * 2);
    border: $switch-button-border-thickness solid $switch-button-color;
    box-shadow: inset 0px 0px $switch-button-border-thickness 0px
      rgba(0, 0, 0, 0.33);
    border-radius: if($switch-is-rounded, $switch-button-height, 0);

    transition: $switch-transition;

    $button-side-length: calc(
      #{$switch-button-height} - (2 * #{$switch-button-border-thickness})
    );

    cursor: pointer;

    .button {
      height: $button-side-length;
      width: $button-side-length;
      border: $switch-button-border-thickness solid $switch-button-color;
      border-radius: if($switch-is-rounded, $button-side-length, 0);
      background: $switch-button-color;

      transition: $switch-transition;
    }

    &.enabled {
      background-color: lighten($switch-button-color, 10%);
      border-color: lighten($switch-button-color, 10%);
      box-shadow: none;

      .button {
        background: white;
        transform: translateX(
          calc(#{$button-side-length} + (2 *#{$switch-button-border-thickness}))
        );
      }
    }
  }

  .switch-button-label {
    grid-area: sbl;
    margin-left: 10px;
  }
}
</style>
