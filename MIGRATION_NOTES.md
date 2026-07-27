# Vue 3 + TS Migration Notes

Running log of things intentionally deferred during the migration
(`vue-upgrade` branch) rather than fixed in place. Not a task list for the
migration itself — see the plan for that. Entries here get addressed in a
follow-up effort after the migration/cutover is done.

## Performance: climbing analytics data pipeline is a blocking, un-memoized, eager-compute-everything pipeline

**Where:** `src/components/climbing/ClimberAnalysis.vue`, `src/utils/Stat.ts`, `src/utils/Utils.ts` (`getPieChartData`, `getGradeChartData`, `generateTimeSeries`).

**Symptom (confirmed via a Chrome performance trace on `/climbing/analytics/david-vasko`, 3,413 ascents):**
- Initial load: a single **4.48-second uninterrupted main-thread task** — `preprocessAscent` over every ascent + `Stat.goDeeper()` building the full stat tree + eagerly computing **all 6** dynamic charts' data (grade/area/year/date/month/rating), even though only 1-2 are visible without scrolling, all synchronously with no yielding.
- Changing any filter: `RunMicrotasks` events averaging ~206ms, because `computedCharts` recomputes every chart's full data pipeline (Stat traversal + pie/grade shaping) on *any* reactive change, not just the chart(s) actually affected.
- Fast scrolling: a smaller but noticeable delay, partly Chart.js's stacked-bar-sort plugin recomputing on redraw, partly (before the chart-sizing fix landed) spurious `ResizeObserver` redraws from an unstable canvas size.

**Root cause is structural, not a migration regression** — the original Vue 2 code has the same algorithm/shape (one big computed property building every chart, no caching in `Stat`). The migration ported it faithfully rather than redesigning it, per the migration's own scope.

**Update after Phase 7 (crossword) landed:** `XwordStatBanner.vue`'s `buildXwordChartData()` (`src/utils/Utils.ts`) is a separate, unrelated implementation — plain arrays in, no `Stat` class involved. (Correcting an earlier note here that said otherwise; confirmed by grep, `Stat` has zero consumers outside the climbing feature.) This perf issue is specific to climbing and doesn't affect crossword either way.

**Fix direction for the follow-up effort (not implemented yet):**
- Compute each chart's data independently/lazily (e.g. per-chart computed refs keyed off only what that chart needs) instead of one `computedCharts` loop rebuilding all 6 on every dependency change.
- Memoize `Stat` sub-tree builds — repeated `.get()` calls on the same branch currently re-walk the underlying ascent array rather than caching the result.
- Chunk the initial `preprocessAscent` + `goDeeper` pass (e.g. `requestIdleCallback`/batching) instead of one blocking synchronous pass, or move it off the main thread.

## Future Pinia candidate: crossword `Xword` class

**Where:** `src/components/crossword/Xword.ts` (ported to TS in Phase 7 — was `Xword.js` pre-migration).

Flagged during migration planning: `Xword` is a large stateful class instantiated once and threaded via props/refs across ~10 sibling components (`XwordClueContext`, `XwordCluePanel`, `XwordClues`, `XwordCurrentClue`, `XwordHeader`, `XwordHelp`, `XwordKeyboard`, `XwordSettings`, `XwordStatBanner`, `XwordTools`). Strong Pinia-store candidate for a later effort — would eliminate the prop/ref plumbing and let each sibling read/mutate solver state directly. Phase 7 intentionally ports it to a typed TS class only, preserving the existing prop/ref-passing shape — **not acted on now**, scope stays: get Vue 3 + TS working, not redesign state architecture.

## Discovered pre-existing dead code / latent bugs in the crossword feature (Phase 7)

Found while porting, not fixed — these are behavior changes outside a faithful port's scope, left for the user to decide on separately:

- **`XwordPuzzle.vue`'s `calcWrong()`/`isSpecialInput()` methods are dead code.** Never called from the template — the "wrong" CSS class is computed inline (`showErrors && cell.wrong && cell.entry`) instead of via `calcWrong()`, which is the *only* place that was supposed to emit `updateShownWrong` (feeding `Xword.updateShownErrorFlag()`). Net effect: the "Shown Error" stat shown in `XwordStatBanner.vue` never actually increments during normal play — it's permanently stuck near 0 regardless of how many wrong answers get shown in red. If the "Shown Error" stat matters, wiring `calcWrong()` back into the template's `:class` binding (calling it instead of the inline expression) would fix it.
- **`XwordSearch.vue`'s old `statusSort()` method** and **`XwordPuzzle.vue`'s `@specialKeyboard` listener** (declared by the parent `XwordSolver.vue`, never emitted by the child) were similarly unreferenced dead code — dropped during the port since they had zero effect either way.

## Reported bug: multi-value-input tooltip flashes literal "&nbsp;" text instead of a blinking cursor

**Where:** `src/components/crossword/XwordPuzzle.vue` and `XwordClueContext.vue`, the `v-tooltip="{ content: cell.entry + flashDash, ... }"` binding, where `flashDash` alternates every 500ms between `"_"` and `"&nbsp;"`.

**Reported symptom:** hovering an empty/multi-value cell shows the tooltip visibly flashing/jumping between "_" and the literal text "&nbsp;" (not a rendered space).

**Root cause (confirmed by reading floating-vue's source):** floating-vue's tooltip content defaults to **plain text** rendering (`html: false` is the library-wide default, `floating-vue.mjs` line ~59) unless the directive binding explicitly sets `html: true`. Neither binding does, so the `&nbsp;` HTML entity is never parsed — it renders as its 6 literal characters. The perceptible "flash"/jump is a secondary effect of the same cause: "_" and the literal string "&nbsp;" are very different widths, so floating-ui's auto-positioning visibly resizes/repositions the tooltip bubble every 500ms.

**Likely pre-existing, not a migration regression** — floating-vue is the direct successor to the old `v-tooltip` package and was built to match its API/defaults, including this one; the old binding didn't set `html: true` either. Not confirmed without a browser to test the pre-migration app, but the mechanism is identical either way.

**Fix direction:** add `html: true` to both `v-tooltip` bindings (`XwordPuzzle.vue` and `XwordClueContext.vue`), and change `flashDash`'s blink-off state from the string `"&nbsp;"` to an actual non-breaking-space character (`" "`) or a fixed-width placeholder, so the two blink states render at matching widths and the tooltip stops visibly jumping.

## Reported bug: flagged cells show no visual indicator

**Where:** `src/assets/styles/xword-puzzle.scss`.

**Reported symptom:** toggling a cell's flag (the flag toolbar button) doesn't visibly change the cell's appearance.

**Root cause (confirmed):** the `.flagged` CSS rule is present in the stylesheet but **commented out**:
```scss
// .flagged {
//   .cell-wrapper {
//     border: 2px solid rgb(255, 166, 2) !important;
//   }
// }
```
This is a **confirmed pre-existing bug, not a migration regression** — `xword-puzzle.scss` was copied byte-for-byte in Phase 1 with no changes. The underlying state tracking is correct (`Xword.toggleCellFlag()` flips `cell.flag`, and the template's `:class="{ flagged: cell.flag, ... }"` binding is applied correctly) — only the visual styling was left commented out in the original app.

**Fix direction:** uncomment the `.flagged` block above (matching the already-live `.exact`/`.autosolved`/`.wrong` sibling rules' pattern).

## Discovered dead (and already-broken) code in the WebGL feature (Phase 8)

**Where:** the pre-migration `src/views/webgl/class/Galaxy.js`'s `rebindBufferData()` method — dropped entirely from the `Galaxy.ts` port (`src/views/webgl/class/Galaxy.ts`).

**Confirmed dead:** `grep -rn "rebindBufferData" src/` matches only the method's own definition — it is never called anywhere in the original app.

**Confirmed already broken, independent of dead-code status:** its internal call `wglu.attrib(gl, loc.a.pos, 3, buf.pos)` passes 4 arguments where `attrib(gl, program, attributeName, length, buf)` requires 5 (`attributeName` missing) — `buf` would resolve to `undefined` and the call would throw at runtime if it were ever invoked. Not a migration regression; the original was non-functional as written.

**Action taken:** removed rather than ported with invented/guessed-correct arguments, consistent with how other confirmed-dead code was handled in Phases 6-7 (`ClimberSelect.vue`'s dead `sandboxId` guard, `XwordPuzzle.vue`'s `calcWrong()`/`isSpecialInput()`, `XwordSearch.vue`'s `statusSort()`). No fix direction needed — nothing depended on it.

## Vue 3 breaking change forced a real (behavior-preserving) restructuring in the WebGL feature (Phase 8)

**Where:** `Fractals.vue`, `Cubert.vue`, `FfViiTextures.vue`, `Galaxy.vue` — all four embedded their vertex/fragment GLSL shader source directly as nested `<script id="vertex-shader">`/`<script id="fragment-shader">` tags inside the component `<template>`, which `ShaderUtils.init()` (formerly a `WebGLUtils` mixin method) reads via `document.getElementById(id).text`. This rendered fine under Vue 2's template compiler.

**Confirmed via the dev server:** Vue 3's `@vue/compiler-dom` hard-errors on this pattern — `"Tags with side effect (<script> and <style>) are ignored in client component templates."` (`ignoreSideEffectTags` in `compiler-dom`). This is not a lint nuance or a false positive; it is a categorical rejection, so the old pattern cannot be ported as-is under any component API style.

**Fix (mechanism-only, no behavior change):** added `injectShaderScript(id, type, source)` / `removeShaderScript(id)` to `src/utils/webgl/WebGLUtils.ts`, which create/remove a real `<script>` element via `document.createElement` (imperative DOM API, not a Vue template), so `ShaderUtils.init()`'s `getElementById(...).text` lookup keeps working completely unchanged. Each shader's GLSL source moved from the template into a `const vertexShaderSrc`/`fragmentShaderSrc` template string in `<script setup>`; each view now calls `injectShaderScript(...)` for both shaders in `onMounted` (before `configureWebGL()`) and `removeShaderScript(...)` in `onUnmounted`. The explicit teardown matters: all four views reuse the same two DOM ids ("vertex-shader"/"fragment-shader"), so without removing them on unmount, navigating between two WebGL demo routes in the same SPA session would silently compile the wrong (stale) shader source into the new page's `WebGLProgram`.

Confirmed no compiler error and normal route resolution (200) for all five WebGL routes (`/webgl/fractals`, `/webgl/cubert`, `/webgl/ffvii-textures`, `/webgl/galaxy`, `/webgl/island-game`) via the Vite dev server after the fix; no headless-browser WebGL rendering verification was possible in this environment (same constraint noted for other feature areas).

## Root `.nvmrc` / CLAUDE.md Node version note is stale — fix at Phase 12 cutover

**Where:** root `.nvmrc` (pins `20`) and `CLAUDE.md` ("Node 20 required (see `.nvmrc` / `engines` in `package.json`)").

Both are out of date relative to what's actually required: the root `package.json`'s own `engines` field says `>=22`, and `app/package.json` (the create-vue scaffold, Phase 0) says `engines: "^22.18.0 || >=24.12.0"` — stricter still, and doesn't include 20. Type-check/lint/build were spot-verified clean under both Node 20 and Node 22 during Phase 8, so nothing in the port actually depends on the wrong version — this is a docs/config drift issue, not a functional one.

**Fix direction:** when `app/`'s contents move to repo root during Phase 12 cutover, `app/package.json` (with the correct `engines`) replaces the root one anyway — update root `.nvmrc` to match at that point and correct CLAUDE.md's Node version line. Until then, local tooling commands (`type-check`/`lint`/`build`) should be run with `nvm use 22` (or higher), not the `.nvmrc`-indicated 20.

**Resolved in Phase 12:** `.nvmrc` bumped to `22`; `CLAUDE.md`'s Node version line corrected.

## Pre-existing `<tr>` not nested in `<thead>`/`<tbody>` (Vue 3 dev-server warning, not a migration regression) — fixed, see below

**Where:** `src/components/climbing/charts/SettingView.vue` — a `<table class="basic-table">` with several `<tr>` elements as direct children of `<table>`, with no intervening `<tbody>`.

**Symptom:** Vite dev server logs `<tr> cannot be child of <table>, according to HTML specifications. This can cause hydration errors or potentially disrupt future functionality.` when the component compiles. Confirmed via a side-by-side dev-server check that this fires identically before and after Phase 12's `npm run format` pass — not something the reformat introduced.

**Not a migration regression** — this is invalid-but-browser-tolerated HTML (browsers auto-insert an implicit `<tbody>` at parse time, so it renders correctly) that was already present in the original Vue 2 `SettingView.vue`; Vue 2 just didn't have this particular compiler warning. No functional impact observed; not fixed here as it's outside Phase 12's scope.

**Fix direction:** wrap the `<tr>` elements in a `<tbody>` (and split header rows into a `<thead>` if any are header rows) to match valid HTML table structure.

## Migration complete (Phase 12)

The Vue 2 → 3 / JavaScript → TypeScript migration (Phases 0–12) is done: `app/`'s contents have been promoted to repo root, the old Vue 2 codebase and vue-cli tooling removed, and this branch is ready to merge into `master`. The entries above remain open — nothing on this list was acted on as part of the migration itself, per its scope (faithful port, not a redesign). Treat this file as the starting punch list for the first follow-up effort; the biggest item is the climbing-analytics performance work at the top of this file, followed by the `Xword` → Pinia store candidate.

## `npm run format` will silently break inline multi-statement event handlers unless guarded — now guarded

**Where:** any `@event="statementOne(); statementTwo()"` Vue template binding that Prettier line-wraps because it's too long for one line. Currently 5 such bindings, in `src/components/climbing/ClimberAscentTable.vue` (x2), `src/components/crossword/XwordHeader.vue` (x1), `src/views/crossword/XwordSolver.vue` (x2).

**Root cause:** Vue's template compiler requires an explicit `;` between statements in an inline event handler (it doesn't apply JS's automatic-semicolon-insertion the way a real function body does). This project's `.prettierrc.json` has `semi: false`. When Prettier reformats one of these bindings across multiple lines (because the single-line version exceeds `printWidth`), it drops the semicolon between the two statements as part of its normal "omit unnecessary semicolons" behavior — not realizing it's *necessary* here — producing a hard Vue template parse error (`Unexpected token, expected ","`) on the next build. This first surfaced during Phase 12's `npm run format` pass and was fixed by hand; **it recurred identically the next time `npm run format` was run** (during the Sass `@import`→`@use` cleanup), confirming it's not a one-off but a standing hazard any time these 5 bindings get reformatted again.

**Fix:** re-added the semicolons, and added `<!-- prettier-ignore -->` immediately before each of the 5 affected elements so Prettier can no longer touch (and re-break) them. Verified idempotent — a subsequent `npm run format` run reports zero modified files.

**If you add a new multi-statement inline handler:** either keep it short enough to stay on one line (safe either way), or if it needs to wrap, add `<!-- prettier-ignore -->` above the element up front rather than discovering the break at build time.

## Fixed: `Stat.goDeeper()`'s ignore list never actually shrank the tree, only the work to populate it

**Where:** `src/utils/Stat.ts`'s `goDeeper()`. Pre-existing since the original 2019 `Stat.js` — confirmed via `git show` against that commit, byte-identical logic. Not a migration regression.

**Bug:** `this.get(k, false, true).ready = true` sat *outside* the `if (!this.ignore.has(k))` block, so it ran for every category key regardless of ignore status. `.get(..., true)`'s third argument (`createOnEmpty`) unconditionally calls `addSubStat()`, which creates a `subStats` entry — so every ignored field still got an empty, `ready: true` stub in the tree. The ignore list (and, once added in this branch, the `STAT_CATEGORY_ALLOWLIST` it's now computed from) correctly skipped the *expensive* per-category work (incrementing, walking array/scalar values, building the value-level substats) for ignored keys, but never actually kept them out of `subStats` — so `Object.keys(stat.subStats)` always showed every field that exists on the raw data, ignored or not.

**Consequence:** the "shrinks `SettingView.vue`'s Base Stat dropdown from ~30 near-nonsensical options down to ~17 meaningful ones" claim in this branch's Stat-allowlist commit was **not actually true as shipped** — the dropdown still showed close to all ~82 fields either way, just with far less work behind ignored ones. Caught while writing a before/after performance benchmark for this same commit sequence (see below) — the benchmark's category count didn't drop with the allowlist the way it should have, which is what surfaced this.

**Fix:** moved `catagoryStat.ready = true` inside the `if` block (using the already-in-scope `catagoryStat` instead of re-calling `.get()`), so a category never gets created in `subStats` at all if it's ignored. Value-level substats' `.ready` (unrelated - stays lazily `false` for multi-level drill-down, e.g. `stats.get('grade').get('V5').get('area')`) is untouched.

**Verified:** real-data regression check (same `david-vasko.json`, 3413 ascents) before/after this fix - `subStats` category count went from 82 → 17 (exactly the allowlist size), while every downstream value (chart subtitles/label counts, `climberStatsSummary`, `uniqueGrades`, filtered counts) came out byte-identical. See the performance section below for the benchmark this was caught in.

## Climbing perf fix: measured results

Benchmarked the actual hot path (`preprocessAscent` + `goDeeper()` + a filter-and-traverse pass) against the real ticklist worst case (16,812 ascents across 21 scorecards as of this writing) by running the pre-fix `Stat.ts` (from `master`, wrapped in a Vue `ref()` exactly like the old `SandboxTicklist.vue` did) side by side with the current code, in Node via `tsx` (no browser available in this environment, so this isolates and measures the exact mechanism identified below rather than a full page trace):

| | `goDeeper()` build | filter + traverse | `subStats` categories |
|---|---|---|---|
| Before (`master`, reactive `ref`, `ignore: ['comment']`) | ~8.3s | ~2.1s | 82 |
| After (`markRaw` + `shallowRef` + allowlist, this branch) | ~66ms | ~111ms | 17 |

That ~8.3s alone, on the worst-case page, is consistent with the ~8s full-page-load the user reported on the pre-fix dev server (vs. ~4s on the currently-deployed `master`). The fix is the `markRaw()`/`shallowRef` change (`Stat: markRaw() instances...` commit) plus the allowlist (`Tighten climbing Stat tree ignore list...` commit) - both land their full benefit together; the `goDeeper()` bug fix just above this entry doesn't materially change the timing (its effect is on tree *shape*, not the amount of increment work skipped, which the allowlist already handled), but is included here since it was caught by this same benchmark.

Not done: chunking/idle-time yielding for `preprocessAscent`/`goDeeper`. The `master` baseline ran the identical fully-synchronous pass with no chunking and still measured a `goDeeper()`-only cost far smaller than the reactive-Proxy tax being removed - the fix here should already be well within an acceptable range without it. If the deployed page still feels slow after this lands, re-measure with a real Chrome trace (this environment has none) before reaching for chunking.

## Fixed: `/climbing/analytics/:sandboxId` hung indefinitely ("page not responding") after the Pinia migration

**Reported:** the page never left its loading spinner and Chrome's own hang detector fired. `/climbing/ticklist` (same `Stat`/store/filtering machinery, larger dataset) worked fine, which ruled out `Stat.ts`, `shallowRef`/`markRaw`, `buildStatTree`, and `StatFilter.vue` as the cause - all shared between both pages.

**Investigation:** every piece of pure logic unique to the analytics page (`buildDynamicChart`, `climberStatsSummary`/`dateAnalysis`/`ascentAnalysis`, `generateTimeSeries`, and a real `Pinia` + `Vue` reactivity simulation of `ChartHandler.vue`'s per-instance `computed()` via `effectScope()`) was exercised directly against real scorecard data and came back fast and stable every time - no hang reproduced outside a real browser. Attempted an actual component mount (`happy-dom` + `@vue/test-utils` + `vite-node`, temporarily installed with `--no-save`, removed after) to get closer to real DOM/Vue-lifecycle behavior; hit tooling friction (Vue 3's DOM node ops module capturing a stale `document` reference at import time under `vite-node`'s loader) that didn't resolve in reasonable time. **No definitive, reproduced root cause** - this environment has no real browser, and the mechanism most likely needed one (Chart.js/vue-chartjs canvas rendering and/or `ResizeObserver` interaction, not plain JS/Vue reactivity, which tested clean).

**Fixed anyway, on strong circumstantial grounds:**
1. **`chartOpts`/`colors` are now `markRaw()`'d in `addDynamicChart` before ever entering the reactive `charts.dynamic` array** (`useClimberAnalysisStore.ts`). Both objects are mutated directly by third-party code outside Vue's awareness - Chart.js writes its own internal bookkeeping into the options object it's handed, and `getPieChartData` (`Utils.ts`, unchanged, pre-existing) grows `colors` in place as new labels are discovered. Letting a Vue reactive Proxy wrap either one is a well-documented source of update loops in the vue-chartjs ecosystem (Chart.js's internal mutation re-triggers Vue reactivity, which re-passes options to Chart.js, which mutates again). This was **already happening before this branch** (`charts` was already `reactive()` in the original `ClimberAnalysis.vue`), but the previous single-monolithic-`computedCharts` structure likely masked/throttled it (Vue batches multiple synchronous triggers into one flush); moving to one `computed()` per `ChartHandler` instance may have removed that incidental throttling. Verified after the fix: `isReactive(chartOpts)`/`isReactive(colors)` both `false`, `isReactive(opts)` (the rest - `filters`, `hideChart`, `splitStat`, etc., which `SettingView.vue`'s `v-model`s still need reactive) stays `true`; chart data, colors (stable across rebuilds), and `climberStatsSummary` all verified unchanged.
2. **Restored `onUpdated(() => { loading.value = false })`**, present in the original `ClimberAnalysis.vue` and dropped without justification during the store migration. Its existence in the original is itself a hint that this exact "loading never clears" failure mode had been hit before; there was no good reason to drop a working safety net during a refactor that wasn't supposed to change this component's behavior.

**If this recurs:** it needs a real browser to diagnose properly (a Chrome performance/timeline recording on the hung page, per `MIGRATION_NOTES.md`'s existing climbing-perf entry's methodology) - this environment cannot reproduce Canvas/DOM-layout-level effects.

## Fixed: `<tr>` not nested in `<thead>`/`<tbody>` in `SettingView.vue`

Previously documented as a known, deferred, out-of-scope pre-existing issue (see the Phase-12 entry above) - now fixed since it came up again as an active complaint rather than something to defer. Wrapped the existing `<tr>` rows in a `<tbody>`; no other change. Confirmed zero `DEPRECATION WARNING`/`<tr> cannot be child of <table>` lines in the dev server log after the fix.
