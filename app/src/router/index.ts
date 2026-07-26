import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { h } from "vue";
import NestedViewer from "@/components/NestedViewer.vue";

declare module "vue-router" {
  interface RouteMeta {
    // flags a top-level route for inclusion in App.vue's main nav bar
    isMainNav?: boolean;
    // used by App.vue's main nav and NestedViewer's dropdown in place of a
    // parent route's own (non-navigable) path
    defaultPath?: string;
  }
}

// Pass-through parent route: just renders its matched child route.
const routerViewPassthrough = {
  render() {
    return h("router-view");
  },
};

const routes: RouteRecordRaw[] = [
  // HOME
  {
    path: "/",
    name: "Home",
    meta: { isMainNav: true },
    component: () => import("../views/Home.vue"),
  },
  // CLIMBING
  {
    path: "/climbing",
    name: "Climbing",
    meta: { isMainNav: true },
    component: routerViewPassthrough,
    children: [
      {
        path: "/climbing/videos",
        name: "Videos",
        component: () => import("../views/climbing/ClimbingVideos.vue"),
      },
      {
        path: "/climbing/ticklist",
        name: "Ticklist",
        component: () => import("../views/climbing/SandboxTicklist.vue"),
      },
      {
        path: "/climbing/analytics/:sandboxId",
        name: "Analysis",
        meta: { defaultPath: "/climbing/analytics/david-vasko" },
        component: () => import("../views/climbing/SandboxAnalysis.vue"),
        props: true,
      },
      {
        path: "/climbing/topos/:topoId",
        name: "Topos",
        meta: { defaultPath: "/climbing/topos/rpc" },
        component: () => import("../views/climbing/ClimbingTopos.vue"),
        props: true,
      },
    ],
  },
  // PORTFOLIO - parent route to house dropdown of projects
  {
    path: "/portfolio",
    name: "\xa0\xa0\xa0\xa0Portfolio\xa0\xa0\xa0\xa0",
    meta: { isMainNav: true },
    component: routerViewPassthrough,
    children: [
      {
        path: "/billiard-ball-robot",
        name: "Ball Robot",
        component: () => import("../views/ComingSoon.vue"),
      },
      {
        path: "/webgl",
        name: "WebGL",
        meta: { defaultPath: "/webgl/galaxy" },
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
            component: () => import("../views/ComingSoon.vue"),
          },
          {
            path: "cubert",
            name: "Cubes in Space",
            component: () => import("../views/ComingSoon.vue"),
          },
          {
            path: "ffvii-textures",
            name: "FFVII Textures",
            component: () => import("../views/ComingSoon.vue"),
          },
          {
            path: "galaxy",
            name: "Creating the Galaxy",
            component: () => import("../views/ComingSoon.vue"),
          },
          {
            path: "island-game",
            name: "Island Game",
            component: () => import("../views/ComingSoon.vue"),
          },
        ],
      },
      {
        path: "/numerical",
        name: "Numerical",
        meta: { defaultPath: "/numerical/finite-element" },
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
            component: () => import("../views/ComingSoon.vue"),
          },
          {
            path: "finite-volume",
            name: "Supersonic Jet Inlet",
            component: () => import("../views/ComingSoon.vue"),
          },
        ],
      },
      {
        path: "/crossword/search",
        name: "Crossword",
        component: () => import("../views/ComingSoon.vue"),
      },
    ],
  },
  {
    path: "/climbing/topos",
    component: () => import("../views/climbing/ClimbingTopos.vue"),
  },
  {
    path: "/crossword/:xwordId",
    name: "crossword",
    component: () => import("../views/ComingSoon.vue"),
    props: true,
  },
  {
    path: "/climbing/import/analytics",
    name: "Import Analysis",
    component: () => import("../views/climbing/ClimbingImportAnalysis.vue"),
    props: true,
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../components/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
