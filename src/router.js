import Vue from "vue";
import Router from "vue-router";
import NestedViewer from "./components/NestedViewer.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    // HOME
    {
      path: "/",
      name: "Home",
      isMainNav: true,
      component: () => import("./views/Home.vue"),
    },
    // CLIMBING
    {
      path: "/climbing",
      isMainNav: true,
      name: "Climbing",
      component: {
        render(c) {
          return c("router-view"); // child router container....
        },
      },
      children: [
        {
          path: "/climbing/videos",
          name: "Videos",
          component: () => import("./views/climbing/ClimbingVideos.vue"),
        },
        {
          path: "/climbing/ticklist",
          name: "Ticklist",
          component: () => import("./views/climbing/ClimbingTicklist.vue"),
        },
        {
          path: "/climbing/analytics/:sandboxId",
          defaultPath: "/climbing/analytics/david-vasko",
          name: "Analysis",
          component: () => import("./views/climbing/ClimbingAnalysis.vue"),
          props: true,
        },
      ],
    },
    // PORTFOLIO - Parent route to house dropdown of porjects
    {
      path: "/portfolio",
      name: "\xa0\xa0\xa0\xa0Portfolio\xa0\xa0\xa0\xa0",
      isMainNav: true,
      component: {
        render(c) {
          return c("router-view"); // child router container....
        },
      },
      children: [
        {
          path: "/billiard-ball-robot",
          name: "Ball Robot",
          component: () => import("./views/BallRobot.vue"),
        },
        {
          path: "/webgl",
          defaultPath: "/webgl/galaxy",
          name: "WebGL",
          component: NestedViewer,
          props: {
            childrenPath: ["/portfolio", "/webgl"],
            routePrefix: "/webgl",
            title: "Graphics using WebGL",
          },
          children: [
            {
              path: "fractals",
              name: "Fractals on Canvas",
              component: () => import("./views/webgl/Fractals.vue"),
            },
            {
              path: "cubert",
              name: "Cubes in Space",
              component: () => import("./views/webgl/Cubert.vue"),
            },
            {
              path: "ffvii-textures",
              name: "FFVII Textures",
              component: () => import("./views/webgl/FfViiTextures.vue"),
            },
            {
              path: "galaxy",
              name: "Creating the Galaxy",
              component: () => import("./views/webgl/Galaxy.vue"),
            },
            {
              path: "island-game",
              name: "Island Game",
              component: () => import("./views/webgl/IslandGame.vue"),
            },
          ],
        },
        {
          path: "/numerical",
          defaultPath: "/numerical/finite-element",
          name: "Numerical",
          component: NestedViewer,
          props: {
            childrenPath: ["/portfolio", "/numerical"],
            routePrefix: "/numerical",
            title: "Numerical Analysis",
          },
          children: [
            {
              path: "finite-element",
              name: "Neo-Hookean Membranes",
              component: () => import("./views/compute/FiniteElement.vue"),
            },
            {
              path: "finite-volume",
              name: "Supersonic Jet Inlet",
              component: () => import("./views/compute/FiniteVolume.vue"),
            },
          ],
        },
        {
          path: "/crossword/search",
          name: "Crossword",
          component: () => import("./views/crossword/XwordSearch.vue"),
        },
      ],
    },

    {
      path: "/crossword/:xwordId",
      name: "crossword",
      component: () => import("./views/crossword/XwordSolver.vue"),
      props: true,
    },
    { path: "*", component: () => import("./components/NotFound.vue") },
  ],
});
