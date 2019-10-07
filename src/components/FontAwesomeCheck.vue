<template>
  <div class="font-awesome-check" @click="$emit('toggle')">
    <div
      :class="{
        enabled: enabled,
        disabled: !enabled
      }"
    >
      <i
        :class="[
          'far',
          {
            'fa-check-square': enabled,
            'fa-window-close': !enabled
          }
        ]"
      ></i>
      {{ desc }}
    </div>
  </div>
</template>

<script>
export default {
  name: "FontAwesomeCheck",
  props: {
    enabled: Boolean,
    desc: String
  }
};
</script>

<style lang="scss" scoped>
.font-awesome-check {
  margin-left: 5%;
  i {
    width: 16px;
  }
  cursor: pointer;
  .enabled {
    color: green;
  }
  .disabled {
    color: gray;
  }
  &:hover {
    color: green;
    .disabled {
      color: purple;
    }
  }
}
</style>
