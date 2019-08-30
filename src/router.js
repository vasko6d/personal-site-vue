import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("./views/Home.vue")
    },
    {
      path: "/billiard-ball-robot",
      name: "ball-robot",
      component: () => import("./views/BallRobot.vue")
    },
    {
      path: "/island-game",
      name: "island-game",
      component: () => import("./views/IslandGame.vue")
    },
    {
      path: "/finite-volume",
      name: "finite volume",
      component: () => import("./views/FiniteVolume.vue")
    },
    {
      path: "/finite-element",
      name: "finite element",
      component: () => import("./views/FiniteElement.vue")
    },
    {
      path: "/webgl-graphics",
      name: "WebGL Examples",
      component: () => import("./views/webgl/WebGLExamples.vue"),
      children: [
        {
          path: "fractals",
          name: "Fractals on Canvas",
          component: () => import("./views/webgl/Fractals.vue")
        },
        {
          path: "cubert",
          name: "Cubes in Space",
          component: () => import("./views/webgl/Cubert.vue")
        },
        {
          path: "ffvii-textures",
          name: "FFVII Textures",
          component: () => import("./views/webgl/Fractals.vue")
        },
        {
          path: "galaxy",
          name: "Creating the Galaxy",
          component: () => import("./views/webgl/Fractals.vue")
        }
      ]
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
