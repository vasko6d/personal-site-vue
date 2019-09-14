<template id="switch-button">
  <div class="switch-button-control">
    <div class="switch-button" :class="{ enabled: isEnabled }" @click="toggle">
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
    isEnabled: Boolean
  },
  methods: {
    toggle: function() {
      this.$emit("toggle", !this.isEnabled);
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
.switch-button-control {
  display: grid;
  justify-content: right;
  grid-template-areas: "sb sbl";

  .switch-button {
    grid-area: sb;
    $switch-button-height: 1.6em;
    $switch-button-border-thickness: 2px;
    $switch-transition: all 0.3s ease-in-out;
    $switch-is-rounded: true;

    height: $switch-button-height;
    width: calc(#{$switch-button-height} * 2);
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
      border-radius: if($switch-is-rounded, $button-side-length, 0);

      transition: $switch-transition;
    }

    &.enabled {
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
