# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

David Vasko's personal website — a Vue 2 SPA hosted statically on Netlify (https://david.vaskos.com). It has no backend; all "dynamic" data (climbing scorecards, crossword puzzles) is pre-generated JSON committed under `public/json/` and fetched client-side. Node 20 required (see `.nvmrc` / `engines` in `package.json`).

## Commands

```
npm install        # install deps
npm run serve       # dev server with hot reload (vue-cli-service serve)
npm run build        # production build to dist/
npm run test         # run tests (no test suite currently exists in src/)
npm run lint         # eslint + prettier, auto-fix
```

There is no single-test-file runner configured since no test framework/spec files exist yet (see `Todo.md` "add test cases" under High Priority).

## Architecture

The app is one Vue 2 + Vuex + vue-router project (`vue-cli` scaffold, Sass/SCSS styling) containing several largely independent feature areas living side by side under `src/`. When working in one area, you generally don't need to understand the others.

### Routing (`src/router.js`)
- History-mode router. Top-level routes flagged `isMainNav: true` are auto-collected by `App.vue` to build the main nav bar (see `mounted()` in `App.vue`).
- Nested feature areas (WebGL demos, Numerical/compute demos) use a generic `NestedViewer` component (`src/components/NestedViewer.vue`) as a pass-through parent route: it reads its own children from `$router.options.routes` (matched via a `childrenPath` prop) and renders a dropdown + `<router-view>` for whichever child is active. This is how new WebGL/Numerical demo pages get added — add a route entry to the `children` array, not a new top-level component.
- Route entries can define a `defaultPath`, used both by `NestedViewer`'s dropdown and by `App.vue`'s main nav for parent routes.

### Theming
- Vuex `store.js` holds a single `theme` string (`light`/`dark`/`blue`/`pink`), persisted to `localStorage.theme` and restored on `App.vue` mount.
- Each theme is a small SCSS partial (`src/assets/styles/{light,dark,blue,pink}-theme.scss`) defining a handful of color variables, then importing the shared `style-base.scss`. `wrapper.scss` conditionally imports the right theme partial based on the `.light`/`.dark`/`.blue`/`.pink` class Vuex applies to `#app`. Adding a theme means adding a new variables partial + a class branch in `wrapper.scss`, not touching component templates.

### Climbing / analytics (`src/components/climbing/`, `src/views/climbing/`)
This is the most complex feature area — a generic stats/aggregation engine built on top of 8a.nu scorecard exports:
- Raw per-climber ascent data lives as static JSON at `public/json/8a-scorecards/<slug>.json`. There is no live 8a.nu API integration; scorecards must be re-exported and committed manually to update data (per README).
- `src/mixins/Stat.js` is a generic recursive counter/tree class (`Stat`): call `.get(category, ..., createOnEmpty)` to lazily build a nested tree of counts across arbitrary categorical fields (area, grade, year, flags, etc.), `.goDeeper()` expands one more level on demand. `.getFromPath(statPath)` / `.getFiltered(base, filters)` are the read APIs the chart components use.
- `src/mixins/Aggregate.js` defines the aggregator functions (`avg`, `max`, `sum`, `pct`, `count`, `distinctCount`) that operate on a `Stat` node, plus a `compatibility` map of which aggregators are valid for which category, and `makeTitle()` for human-readable chart titles. When adding a new statistic/category, it needs to be added to `Aggregate`'s `compatibility` map to be selectable in the UI.
- `src/mixins/Utils.js` has shared helpers (e.g. `makeInt` for turning categorical values back into sortable numbers, `prettyCapitalize`).
- The chart UI (`src/components/climbing/charts/`) — `ChartHandler` / `ChartView` / `SettingView` / `AscentView` / `TimeSeriesChart` — lets a user pick a stat path + aggregator + filters and renders it via `chart.js`/`vue-chartjs` wrappers in `src/components/charts/`.
- `ClimberSelect` / `ClimberColumnSelect` / `ClimberAnalysis` drive picking a climber (i.e. which JSON file) and column/table display; `ClimberAscentTable` uses `vue-tables-2`.

### Crossword solver (`src/components/crossword/`, `src/views/crossword/`)
- `Xword.js` is a plain JS class (not a component) encapsulating full crossword state/logic: cell grid parsing from a compact solution string (special chars: `#` black, `_` null, `|` sequence, `=` equals, `:` across/down-differs — see the `sChars` map at the top of the file), clue navigation, flags, autosolve, and localStorage-based progress persistence (bump `savedDataVersion` in that file if the saved-state shape changes).
- Puzzle content is static JSON under `public/json/xwords/{clues,solutions,options}/<id>.json` plus a shared `public/json/xwords/headers.json` index; `XwordSearch.vue` lists/searches puzzles, `XwordSolver.vue` (routed at `/crossword/:xwordId`) loads one and hosts the `Xword` instance.
- UI is decomposed into many small presentational components (`XwordKeyboard`, `XwordClues`, `XwordCluePanel`, `XwordCurrentClue`, `XwordSettings`, `XwordTools`, `XwordStatBanner`, etc.) that all read/mutate the shared `Xword` instance passed down from `XwordSolver.vue`.

### WebGL demos (`src/views/webgl/`, `src/components/webgl/`, `src/mixins/webgl/`)
- Raw WebGL (no three.js) demos: Galaxy, Fractals, Cubert, FFVII textures, Island Game. Shared low-level helpers live in `src/mixins/webgl/` (`WebGLUtils.vue`, `ShaderUtils.vue`, `MatrixMath.vue`, `Timer.js`); `WebglCamera.vue` and `ActionControls.vue`/`ControlHelpModal.vue` are the shared camera/controls UI used across demos. `src/views/webgl/class/Galaxy.js` / `Planet.js` are plain JS simulation classes used by the Galaxy demo.
- These demos are registered as children under the `/webgl` `NestedViewer` route (see Routing above).

### Numerical/compute demos (`src/views/compute/`)
`FiniteElement.vue` (Neo-Hookean membranes) and `FiniteVolume.vue` (supersonic jet inlet) — self-contained numerical simulation demos, registered under the `/numerical` `NestedViewer` route.

### Custom directive: `v-closable` (`src/main.js`)
A global directive registered in `main.js` (not a component) implementing "click outside to close" for dropdowns (used by `App.vue`'s main nav and `NestedViewer`'s dropdown). Takes `{ handler, excludeList, uniqueFxnId }` — `excludeList` is a list of `ref` names whose click events should *not* count as "outside"; `uniqueFxnId` must be unique per open dropdown instance so listener add/remove doesn't clobber another dropdown's handler.

## Deployment

Static hosting on Netlify. `public/_redirects` handles the old `vasko6d.netlify.com` → `david.vaskos.com` domain redirect and the SPA history-mode fallback (`/* /index.html 200`).
