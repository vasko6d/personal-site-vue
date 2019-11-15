import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { ClientTable } from "vue-tables-2";
Vue.use(ClientTable);
import VTooltip from "v-tooltip";
Vue.use(VTooltip);

Vue.config.productionTip = false;

// Directive to make the allow items to have an "off-click" event
let handleOutsideClick = {};
Vue.directive("closable", {
  bind(el, binding, vnode) {
    const { handler, excludeList, uniqueFxnId } = binding.value;
    // handler: fxn to close the 'closable' element
    // excludeList: the list if refs that represent the item being clicked,
    //              as to prevent the 'closable' from closing immediatly when
    //              opening it
    // uniqueFxnId: a hack to make sure that the registered "click/touch" event
    //              has a unique way to be identified, otherwise the
    //              removeEventListener may remove the wrong event.
    handleOutsideClick[uniqueFxnId] = e => {
      e.stopPropagation();
      let clickedOnExcludedEl = false;
      excludeList.forEach(exclude => {
        if (!clickedOnExcludedEl) {
          const excludedEls = vnode.context.$refs[exclude];
          if (Array.isArray(excludedEls)) {
            excludedEls.forEach(excludedEl => {
              clickedOnExcludedEl = excludedEl === e.target;
            });
          } else {
            clickedOnExcludedEl = excludedEls === e.target;
          }
        }
      });
      if (!el.contains(e.target) && !clickedOnExcludedEl) {
        //console.log("[Close] Clicked off element");
        vnode.context[handler](uniqueFxnId);
      }
    };
    //console.log("[bind]: " + uniqueFxnId);
    document.addEventListener("click", handleOutsideClick[uniqueFxnId]);
    document.addEventListener("touchstart", handleOutsideClick[uniqueFxnId]);
  },
  unbind(el, binding) {
    const { uniqueFxnId } = binding.value;
    //console.log("[unbind]: " + uniqueFxnId);
    document.removeEventListener("click", handleOutsideClick[uniqueFxnId]);
    document.removeEventListener("touchstart", handleOutsideClick[uniqueFxnId]);
  }
});

// eslint-disable-next-line
var vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
