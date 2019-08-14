import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

// eslint-disable-next-line
var vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
