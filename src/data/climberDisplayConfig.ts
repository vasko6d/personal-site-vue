// App-side climber visibility/ordering config. dv-node-server's manifest has
// no concept of hide/sort-order - this is the one place personal-site-vue
// overrides which climbers show up in list UIs and in what order, without
// touching the generated manifest/scorecard data itself.

// Slugs excluded from every climber-selection LIST (ClimberSelect dropdown,
// the Sandbox Ticklist aggregate, and the Send Cookies aggregate/
// leaderboard). UI-list filter only - a hidden climber's own
// /climbing/analytics/:sandboxId page still works via direct URL.
export const HIDDEN_CLIMBER_SLUGS: ReadonlySet<string> = new Set(['sierra-przychodzen'])

// Explicit ordering for climber-selection lists. Slugs not listed here are
// appended afterward, sorted alphabetically by userName.
export const CLIMBER_SORT_ORDER: readonly string[] = [
  'david-vasko',
  'dirk-irector',
  'munin-agzag',
  'shirley-girth',
  'da-shi-xiong',
  'winifred-affleman',
  'ishmael-matinyman',
  'd-w',
  'bernd-alznurmouth',
  'hal-ford-vnro0',
  'aden-parker',
  'l-i-b',
  'natalie-udelarms',
  'scooter-limb',
  'chris-rush',
  'ryan-bauer',
  'pinch-nick',
  'zev-fineman',
  'fanny-dong',
  'kody-shutt',
]
