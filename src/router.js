import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/portfolio",
      name: "portfolio",
      component: () => import("./views/Portfolio.vue")
    },
    {
      path: "/billiard-ball-robot",
      name: "ball-robot",
      component: () => import("./views/BallRobot.vue")
    },
    {
      path: "/climbing",
      name: "climbing",
      component: () => import("./views/Climbing.vue")
    },
    {
      path: "/crossword",
      name: "crossword",
      component: () => import("./views/Crossword.vue")
    }
  ]
});
