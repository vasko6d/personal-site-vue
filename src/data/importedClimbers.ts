export interface ImportedClimber {
  name: string
  sandboxId: string
}

// pulled out of ClimberSelect.vue's old data() so SandboxTicklist.vue (which
// needs to fetch every climber's scorecard) can share the same list rather
// than reaching into the component's Options-API data() the old code did
export const importedClimbers: ImportedClimber[] = [
  { name: 'G. Recian-God', sandboxId: 'david-vasko' },
  { name: 'C. Haarmed', sandboxId: 'dirk-irector' },
  { name: 'M. Agzag', sandboxId: 'munin-agzag' },
  { name: 'B. Iscuit', sandboxId: 'bella-iscuit' },
  { name: 'Shirley', sandboxId: 'shirley-girth' },
  { name: '大 师兄', sandboxId: 'da-shi-xiong' },
  { name: 'W. Affleman', sandboxId: 'winifred-affleman' },
  { name: 'Im a Tiny Man', sandboxId: 'ishmael-matinyman' },
  { name: 'David Woo', sandboxId: 'd-w' },
  { name: 'B. Alznurmouth', sandboxId: 'bernd-alznurmouth' },
  { name: 'Hal', sandboxId: 'hal-ford' },
  { name: 'Aden Parker', sandboxId: 'aden-parker' },
  { name: 'LIB', sandboxId: 'l-i-b' },
  { name: 'N. Udlearms', sandboxId: 'natalie-udelarms' },
  { name: 'S. Limb', sandboxId: 'scooter-limb' },
  { name: 'Nathaniel Cushing-Murray', sandboxId: 'chris-rush' },
  { name: 'Ryan Bauer', sandboxId: 'ryan-bauer' },
  { name: 'Pinch Nick', sandboxId: 'pinch-nick' },
  { name: 'Daniel Fineman', sandboxId: 'zev-fineman' },
  { name: 'Daniel Fong', sandboxId: 'fanny-dong' },
  { name: 'Kody Shutt', sandboxId: 'kody-shutt' },
]
