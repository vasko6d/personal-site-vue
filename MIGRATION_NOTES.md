# Vue 3 + TS Migration Notes

Running log of things intentionally deferred during the migration
(`vue-upgrade` branch) rather than fixed in place. Not a task list for the
migration itself — see the plan for that. Entries here get addressed in a
follow-up effort after the migration/cutover is done.

## Performance: climbing analytics data pipeline is a blocking, un-memoized, eager-compute-everything pipeline

**Where:** `app/src/components/climbing/ClimberAnalysis.vue`, `app/src/utils/Stat.ts`, `app/src/utils/Utils.ts` (`getPieChartData`, `getGradeChartData`, `generateTimeSeries`).

**Symptom (confirmed via a Chrome performance trace on `/climbing/analytics/david-vasko`, 3,413 ascents):**
- Initial load: a single **4.48-second uninterrupted main-thread task** — `preprocessAscent` over every ascent + `Stat.goDeeper()` building the full stat tree + eagerly computing **all 6** dynamic charts' data (grade/area/year/date/month/rating), even though only 1-2 are visible without scrolling, all synchronously with no yielding.
- Changing any filter: `RunMicrotasks` events averaging ~206ms, because `computedCharts` recomputes every chart's full data pipeline (Stat traversal + pie/grade shaping) on *any* reactive change, not just the chart(s) actually affected.
- Fast scrolling: a smaller but noticeable delay, partly Chart.js's stacked-bar-sort plugin recomputing on redraw, partly (before the chart-sizing fix landed) spurious `ResizeObserver` redraws from an unstable canvas size.

**Root cause is structural, not a migration regression** — the original Vue 2 code has the same algorithm/shape (one big computed property building every chart, no caching in `Stat`). The migration ported it faithfully rather than redesigning it, per the migration's own scope.

**Update after Phase 7 (crossword) landed:** `XwordStatBanner.vue` does use the same `Stat`-based aggregation path (`buildXwordChartData`), but its input is `statData.timeSeries` — one entry per state-changing keystroke in a single puzzle, not thousands of ascents. Data volume there is small; this perf issue is specific to the climbing feature and not expected to be meaningful in crossword.

**Fix direction for the follow-up effort (not implemented yet):**
- Compute each chart's data independently/lazily (e.g. per-chart computed refs keyed off only what that chart needs) instead of one `computedCharts` loop rebuilding all 6 on every dependency change.
- Memoize `Stat` sub-tree builds — repeated `.get()` calls on the same branch currently re-walk the underlying ascent array rather than caching the result.
- Chunk the initial `preprocessAscent` + `goDeeper` pass (e.g. `requestIdleCallback`/batching) instead of one blocking synchronous pass, or move it off the main thread.

## Future Pinia candidate: crossword `Xword` class

**Where:** `app/src/components/crossword/Xword.ts` (once ported in Phase 7 — was `src/components/crossword/Xword.js` pre-migration).

Flagged during migration planning: `Xword` is a large stateful class instantiated once and threaded via props/refs across ~10 sibling components (`XwordClueContext`, `XwordCluePanel`, `XwordClues`, `XwordCurrentClue`, `XwordHeader`, `XwordHelp`, `XwordKeyboard`, `XwordSettings`, `XwordStatBanner`, `XwordTools`). Strong Pinia-store candidate for a later effort — would eliminate the prop/ref plumbing and let each sibling read/mutate solver state directly. Phase 7 intentionally ports it to a typed TS class only, preserving the existing prop/ref-passing shape — **not acted on now**, scope stays: get Vue 3 + TS working, not redesign state architecture.

## Discovered pre-existing dead code / latent bugs in the crossword feature (Phase 7)

Found while porting, not fixed — these are behavior changes outside a faithful port's scope, left for the user to decide on separately:

- **`XwordPuzzle.vue`'s `calcWrong()`/`isSpecialInput()` methods are dead code.** Never called from the template — the "wrong" CSS class is computed inline (`showErrors && cell.wrong && cell.entry`) instead of via `calcWrong()`, which is the *only* place that was supposed to emit `updateShownWrong` (feeding `Xword.updateShownErrorFlag()`). Net effect: the "Shown Error" stat shown in `XwordStatBanner.vue` never actually increments during normal play — it's permanently stuck near 0 regardless of how many wrong answers get shown in red. If the "Shown Error" stat matters, wiring `calcWrong()` back into the template's `:class` binding (calling it instead of the inline expression) would fix it.
- **`XwordSearch.vue`'s old `statusSort()` method** and **`XwordPuzzle.vue`'s `@specialKeyboard` listener** (declared by the parent `XwordSolver.vue`, never emitted by the child) were similarly unreferenced dead code — dropped during the port since they had zero effect either way.

## Reported bug: multi-value-input tooltip flashes literal "&nbsp;" text instead of a blinking cursor

**Where:** `app/src/components/crossword/XwordPuzzle.vue` and `XwordClueContext.vue`, the `v-tooltip="{ content: cell.entry + flashDash, ... }"` binding, where `flashDash` alternates every 500ms between `"_"` and `"&nbsp;"`.

**Reported symptom:** hovering an empty/multi-value cell shows the tooltip visibly flashing/jumping between "_" and the literal text "&nbsp;" (not a rendered space).

**Root cause (confirmed by reading floating-vue's source):** floating-vue's tooltip content defaults to **plain text** rendering (`html: false` is the library-wide default, `floating-vue.mjs` line ~59) unless the directive binding explicitly sets `html: true`. Neither binding does, so the `&nbsp;` HTML entity is never parsed — it renders as its 6 literal characters. The perceptible "flash"/jump is a secondary effect of the same cause: "_" and the literal string "&nbsp;" are very different widths, so floating-ui's auto-positioning visibly resizes/repositions the tooltip bubble every 500ms.

**Likely pre-existing, not a migration regression** — floating-vue is the direct successor to the old `v-tooltip` package and was built to match its API/defaults, including this one; the old binding didn't set `html: true` either. Not confirmed without a browser to test the pre-migration app, but the mechanism is identical either way.

**Fix direction:** add `html: true` to both `v-tooltip` bindings (`XwordPuzzle.vue` and `XwordClueContext.vue`), and change `flashDash`'s blink-off state from the string `"&nbsp;"` to an actual non-breaking-space character (`" "`) or a fixed-width placeholder, so the two blink states render at matching widths and the tooltip stops visibly jumping.

## Reported bug: flagged cells show no visual indicator

**Where:** `app/src/assets/styles/xword-puzzle.scss`.

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
