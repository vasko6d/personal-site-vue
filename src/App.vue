<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>&nbsp;|
      <router-link to="/portfolio">Portfolio</router-link>&nbsp;|
      <router-link to="/climbing">Climbing</router-link>&nbsp;|
      <router-link to="/crossword">Crossword</router-link>
    </div>
    <router-view />
    <footer-links />
  </div>
</template>

<script>
import FooterLinks from "@/components/FooterLinks.vue";

export default {
  name: "app",
  components: {
    FooterLinks
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
