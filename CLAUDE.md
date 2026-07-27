# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

David Vasko's personal website — a Vue 3 + TypeScript SPA hosted statically on Netlify (https://david.vaskos.com). It has no backend; all "dynamic" data (climbing scorecards, crossword puzzles) is pre-generated JSON committed under `public/json/` and fetched client-side. Node 22 required (see `.nvmrc` / `engines` in `package.json`).

## Commands

```
npm install          # install deps
npm run dev           # Vite dev server with hot reload
npm run build          # type-check + production build to dist/
npm run preview         # serve the production build locally
npm run type-check       # vue-tsc --build, no emit
npm run lint          # oxlint + eslint, auto-fix
npm run format         # prettier --write across src/
```

There is no automated test suite (see `Todo.md` "add test cases" under High Priority) — no test framework is configured, and there's no single-test-file runner.

## Architecture

The app is one Vue 3 + Pinia + Vue Router (Vite scaffold, `<script setup lang="ts">` throughout, Sass/SCSS styling) project containing several largely independent feature areas living side by side under `src/`. When working in one area, you generally don't need to understand the others.

### Routing (`src/router/index.ts`)
- History-mode router. Top-level routes flagged `meta: { isMainNav: true }` are auto-collected by `App.vue` to build the main nav bar (see `onMounted()` in `App.vue`). Custom route-meta fields (`isMainNav`, `defaultPath`) are typed via a `declare module "vue-router"` `RouteMeta` augmentation at the top of the file.
- Nested feature areas (WebGL demos, Numerical/compute demos) use a generic `NestedViewer` component (`src/components/NestedViewer.vue`) as a pass-through parent route: it reads its own children from `router.options.routes` (matched via a `childrenPath` prop) and renders a dropdown + `<router-view>` for whichever child is active. This is how new WebGL/Numerical demo pages get added — add a route entry to the `children` array, not a new top-level component.
- Route entries can define `meta: { defaultPath }`, used both by `NestedViewer`'s dropdown and by `App.vue`'s main nav for parent routes.
- Plain pass-through parent routes (e.g. `/climbing`, `/portfolio`) use a small `routerViewPassthrough` render-function component defined in this file. It must call `h(RouterView)` with the imported `RouterView` component, not `h("router-view")` — Vue 3's `h()` doesn't auto-resolve string tags against the global registry the way Vue 2's did, so a string tag creates a literal unknown custom element instead.

### Theming
- A Pinia store (`src/stores/theme.ts`, `useThemeStore`) holds a single `theme` string (`light`/`dark`/`blue`/`pink`), persisted to `localStorage.theme` and restored on `App.vue` mount.
- Each theme is a small SCSS partial (`src/assets/styles/{light,dark,blue,pink}-theme.scss`) defining a handful of color variables, then importing the shared `style-base.scss`. `wrapper.scss` conditionally imports the right theme partial based on the `.light`/`.dark`/`.blue`/`.pink` class the store applies to `#app`. Adding a theme means adding a new variables partial + a class branch in `wrapper.scss`, not touching component templates.

### Climbing / analytics (`src/components/climbing/`, `src/views/climbing/`)
This is the most complex feature area — a generic stats/aggregation engine built on top of 8a.nu scorecard exports:
- Raw per-climber ascent data lives as static JSON at `public/json/8a-scorecards/<slug>.json`. There is no live 8a.nu API integration; scorecards must be re-exported and committed manually to update data (per README).
- `src/utils/Stat.ts` is a generic recursive counter/tree class (`Stat`): call `.get(category, ..., createOnEmpty)` to lazily build a nested tree of counts across arbitrary categorical fields (area, grade, year, flags, etc.), `.goDeeper()` expands one more level on demand. `.getFromPath(statPath)` / `.getFiltered(base, filters)` are the read APIs the chart components use.
- `src/utils/Aggregate.ts` defines the aggregator functions (`avg`, `max`, `sum`, `pct`, `count`, `distinctCount`) that operate on a `Stat` node, plus a `compatibility` map of which aggregators are valid for which category, and `makeTitle()` for human-readable chart titles. When adding a new statistic/category, it needs to be added to `Aggregate`'s `compatibility` map to be selectable in the UI.
- `src/utils/Utils.ts` has shared helpers (e.g. `makeInt` for turning categorical values back into sortable numbers, `prettyCapitalize`) as named exports.
- The chart UI (`src/components/climbing/charts/`) — `ChartHandler` / `ChartView` / `SettingView` / `AscentView` / `TimeSeriesChart` — lets a user pick a stat path + aggregator + filters and renders it via `chart.js` v4 / `vue-chartjs` v5 wrappers in `src/components/charts/`.
- `ClimberSelect` / `ClimberColumnSelect` / `ClimberAnalysis` drive picking a climber (i.e. which JSON file) and column/table display; `ClimberAscentTable` uses the hand-rolled `src/components/shared/DataTable.vue` (typed, generic-over-row-type) rather than a third-party table library.

### Crossword solver (`src/components/crossword/`, `src/views/crossword/`)
- `Xword.ts` is a typed, plain TS class (not a component) encapsulating full crossword state/logic: cell grid parsing from a compact solution string (special chars: `#` black, `_` null, `|` sequence, `=` equals, `:` across/down-differs — see the `sChars` map at the top of the file), clue navigation, flags, autosolve, and localStorage-based progress persistence (bump `savedDataVersion` in that file if the saved-state shape changes). It's instantiated once and threaded via props/refs across its sibling components — see `MIGRATION_NOTES.md` for a flagged future Pinia-store candidate here.
- Puzzle content is static JSON under `public/json/xwords/{clues,solutions,options}/<id>.json` plus a shared `public/json/xwords/headers.json` index; `XwordSearch.vue` (using `DataTable.vue`) lists/searches puzzles, `XwordSolver.vue` (routed at `/crossword/:xwordId`) loads one and hosts the `Xword` instance.
- UI is decomposed into many small presentational components (`XwordKeyboard`, `XwordClues`, `XwordCluePanel`, `XwordCurrentClue`, `XwordSettings`, `XwordTools`, `XwordStatBanner`, etc.) that all read/mutate the shared `Xword` instance passed down from `XwordSolver.vue`. Tooltips use `floating-vue` (`v-tooltip` directive) — note its `html` option defaults to `false` (plain-text rendering), unlike the plain `content` string it's often bound with.

### WebGL demos (`src/views/webgl/`, `src/components/webgl/`, `src/utils/webgl/`)
- Raw WebGL (no three.js) demos: Galaxy, Fractals, Cubert, FFVII textures, Island Game. Shared low-level helpers live in `src/utils/webgl/` as plain typed modules (`WebGLUtils.ts`, `ShaderUtils.ts`, `MatrixMath.ts`, `Timer.ts`, `Camera.ts`); `WebglCamera.vue` and `ActionControls.vue`/`ControlHelpModal.vue` are the shared camera/controls UI used across demos. `src/views/webgl/class/Galaxy.ts` / `Planet.ts` are plain TS simulation classes used by the Galaxy demo. `src/utils/webgl/Camera.ts` holds the camera math functions shared by `WebglCamera.vue` and the view components that drive it — Vue 3 `<script setup>` components have no `.methods` object to import functions off of the way the old Options-API `WebglCamera.vue` did, so these were extracted to a plain module.
- Shader source (GLSL) for each demo is defined as a `const vertexShaderSrc`/`fragmentShaderSrc` template string in the view's `<script setup>` and injected into the DOM as a real `<script>` element on `onMounted` (via `WebGLUtils.ts`'s `injectShaderScript`/`removeShaderScript`, removed on `onUnmounted`) — not written directly in the template. Vue 3's compiler hard-errors on `<script>`/`<style>` tags nested inside a component `<template>` (a Vue 2 → 3 breaking change), which is how these demos originally embedded shader source for `ShaderUtils.init()`'s `document.getElementById(id).text` lookup.
- These demos are registered as children under the `/webgl` `NestedViewer` route (see Routing above).

### Numerical/compute demos (`src/views/compute/`)
`FiniteElement.vue` (Neo-Hookean membranes) and `FiniteVolume.vue` (supersonic jet inlet) — self-contained numerical simulation demos, registered under the `/numerical` `NestedViewer` route.

### Custom directive: `v-closable` (`src/directives/closable.ts`)
A global directive registered in `main.ts` (not a component) implementing "click outside to close" for dropdowns (used by `App.vue`'s main nav and `NestedViewer`'s dropdown). Takes `{ handler, excludeList, uniqueFxnId }` — `excludeList` is a list of `ref` names whose click events should *not* count as "outside"; `uniqueFxnId` must be unique per open dropdown instance so listener add/remove doesn't clobber another dropdown's handler.

## Deployment

Static hosting on Netlify, build/publish settings pinned in `netlify.toml` (build command, `dist/` publish directory, Node version) rather than dashboard-only config. `public/_redirects` handles the old `vasko6d.netlify.com` → `david.vaskos.com` domain redirect and the SPA history-mode fallback (`/* /index.html 200`).
