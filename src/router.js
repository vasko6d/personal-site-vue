import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      isMainNav: true,
      component: () => import("./views/Home.vue")
    },
    {
      path: "/climbing",
      name: "Climbing",
      isMainNav: true,
      component: () => import("./views/Climbing.vue")
    },
    {
      // This is a dummy route that just is a grouping for other routes
      path: "#",
      name: "\xa0\xa0\xa0\xa0Portfolio\xa0\xa0\xa0\xa0",
      isMainNav: true,
      nestedLinks: [
        { path: "/billiard-ball-robot", name: "Ball Robot" },
        { path: "/webgl-graphics/galaxy", name: "Graphics" },
        { path: "/finite-volume", name: "Finite Volume" },
        { path: "/finite-element", name: "Finite Element" },
        { path: "/crossword", name: "Crossword" }
      ]
    },
    {
      path: "/billiard-ball-robot",
      name: "ball-robot",
      component: () => import("./views/BallRobot.vue")
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
          component: () => import("./views/webgl/FfViiTextures.vue")
        },
        {
          path: "galaxy",
          name: "Creating the Galaxy",
          component: () => import("./views/webgl/Galaxy.vue")
        },
        {
          path: "island-game",
          name: "Island Game",
          component: () => import("./views/webgl/IslandGame.vue")
        }
      ]
    },
    {
      path: "/crossword",
      name: "crossword",
      component: () => import("./views/Crossword.vue")
    }
  ]
});
