<template>
  <div id="home">
    <img alt="David Vasko Portrait" src="../assets/img/vasko-nextgate.jpg" />
    <div>
      <span @click="setTheme('light')">light</span>&nbsp;|
      <span @click="setTheme('dark')">dark</span>&nbsp;|
      <span @click="setTheme('blue')">blue</span>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  methods: {
    ...mapActions(["setTheme"])
  }
};
</script>

<style lang="scss">
#home {
  img {
    border-radius: 0.35em;
  }
}
</style>
