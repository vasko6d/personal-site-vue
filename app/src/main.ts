import { createApp } from "vue";
import { createPinia } from "pinia";
import FloatingVue from "floating-vue";
import "floating-vue/style.css";

import App from "./App.vue";
import router from "./router";
import { closable } from "./directives/closable";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(FloatingVue);
app.directive("closable", closable);

app.mount("#app");
