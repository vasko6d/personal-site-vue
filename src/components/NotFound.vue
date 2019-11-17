<template>
  <div id="not-found">
    <div id="anim"></div>
  </div>
</template>

<script>
export default {
  name: "NotFound"
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
#not-found {
  #anim {
    justify-content: center;
    &:after {
      animation: changeLetter 6s linear infinite;
      display: block;
      content: "404 Not Found";
      font-size: 30px;
      font-weight: bold;
    }
  }
  @keyframes changeLetter {
    0% {
      color: rgba(white, 0.1);
    }
    50% {
      color: rgba(white, 0.8);
    }
    100% {
      color: rgba(white, 0.1);
    }
  }
}
</style>
