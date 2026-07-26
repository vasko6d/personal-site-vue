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

**Likely also affects the crossword feature (Phase 7 — not yet ported at the time this note was written):** `XwordStatBanner.vue` calls `Utils.generateTimeSeries`/`buildXwordChartData`, the same `Stat`-based aggregation path. Worth checking data volume there once ported (crossword ascent-equivalent data — cell counts, timer state — is probably much smaller than 3,413 ascents, but the same lazy-uncached-tree-walk pattern applies if `Stat` is used similarly).

**Fix direction for the follow-up effort (not implemented yet):**
- Compute each chart's data independently/lazily (e.g. per-chart computed refs keyed off only what that chart needs) instead of one `computedCharts` loop rebuilding all 6 on every dependency change.
- Memoize `Stat` sub-tree builds — repeated `.get()` calls on the same branch currently re-walk the underlying ascent array rather than caching the result.
- Chunk the initial `preprocessAscent` + `goDeeper` pass (e.g. `requestIdleCallback`/batching) instead of one blocking synchronous pass, or move it off the main thread.

## Future Pinia candidate: crossword `Xword` class

**Where:** `app/src/components/crossword/Xword.ts` (once ported in Phase 7 — was `src/components/crossword/Xword.js` pre-migration).

Flagged during migration planning: `Xword` is a large stateful class instantiated once and threaded via props/refs across ~10 sibling components (`XwordClueContext`, `XwordCluePanel`, `XwordClues`, `XwordCurrentClue`, `XwordHeader`, `XwordHelp`, `XwordKeyboard`, `XwordSettings`, `XwordStatBanner`, `XwordTools`). Strong Pinia-store candidate for a later effort — would eliminate the prop/ref plumbing and let each sibling read/mutate solver state directly. Phase 7 intentionally ports it to a typed TS class only, preserving the existing prop/ref-passing shape — **not acted on now**, scope stays: get Vue 3 + TS working, not redesign state architecture.
