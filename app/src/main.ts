import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { closable } from "./directives/closable";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.directive("closable", closable);

app.mount("#app");
