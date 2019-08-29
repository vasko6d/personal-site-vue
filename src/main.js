import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

// Directive to make the allow items to have an "off-click" event
let handleOutsideClick;
Vue.directive("closable", {
  bind(el, binding, vnode) {
    handleOutsideClick = e => {
      e.stopPropagation();
      const { handler, excludeList } = binding.value;
      let clickedOnExcludedEl = false;
      excludeList.forEach(exclude => {
        if (!clickedOnExcludedEl) {
          //console.log("Will not Close on " + "{" + exclude + "}");
          const excludedEls = vnode.context.$refs[exclude];
          if (Array.isArray(excludedEls)) {
            excludedEls.forEach(excludedEl => {
              clickedOnExcludedEl = excludedEl === e.target;
            });
          } else {
            //console.log(excludedEls);
            //console.log(e.target);
            clickedOnExcludedEl = excludedEls === e.target;
          }
        }
      });
      if (!el.contains(e.target) && !clickedOnExcludedEl) {
        //console.log("[Close] Clicked off element");
        vnode.context[handler]();
      }
    };
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
  },
  unbind() {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("touchstart", handleOutsideClick);
  }
});

// eslint-disable-next-line
var vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
