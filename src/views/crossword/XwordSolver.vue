<script setup lang="ts">
import { computed, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import Xword, { type ClueMap } from '@/components/crossword/Xword'
import XwordPuzzle from '@/components/crossword/XwordPuzzle.vue'
import XwordCluePanel from '@/components/crossword/XwordCluePanel.vue'
import XwordCurrentClue from '@/components/crossword/XwordCurrentClue.vue'
import XwordKeyboard from '@/components/crossword/XwordKeyboard.vue'
import XwordHeader from '@/components/crossword/XwordHeader.vue'
import XwordStatBanner from '@/components/crossword/XwordStatBanner.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import type { SetOptionPayload, XwordOpts } from '@/components/crossword/types'

const props = defineProps<{
  xwordId: string
}>()

function defaultOpts(save = false): XwordOpts {
  const ret: XwordOpts = {
    clues: {
      showCluePanel: true,
      contextOpt: 'always',
      contextOpts: [
        { name: 'Always show clue context', val: 'always' },
        { name: 'Click clue to toggle context', val: 'toggle' },
        { name: 'Never show clue context', val: 'never' },
      ],
      hideClueOpt: 'never',
      hideClueOpts: [
        { name: 'Hide clues that are CORRECT and filled', val: 'onCorrect' },
        { name: 'Hide clues that are filled', val: 'onFill' },
        { name: 'Never hide clues', val: 'never' },
      ],
    },
    keyboard: {
      showOnPageKeyboard: true,
      enableNativeKeyboardToggle: false,
    },
    currentClue: {
      loc: 'top',
      locOpts: [
        { name: 'Show curernt clue ABOVE grid', val: 'top' },
        { name: 'Show current clue BELOW grid', val: 'bottom' },
      ],
    },
    errors: {
      showErrors: false,
    },
    navigation: {
      autoSkipFilledCells: true,
    },
  }
  if (save) {
    localStorage['xwordOpts'] = JSON.stringify(ret)
  }
  return ret
}

const opts = ref<XwordOpts>(defaultOpts())
const loadingMessage = ref<string | undefined>('Loading Crossword...')
const xword = ref(new Xword('', '', '', '', [], {}, {}))
const clickedClue = ref<Partial<import('@/components/crossword/Xword').Clue>>({}) // hacky to make clue context togglable....
const contextEnabled = ref(false)
const forceSpecialKeyboard = ref(false)
const keyboardMasterOverride = ref(false)
const pseudoInput = ref<HTMLInputElement | null>(null)

const currentClue = computed(() => {
  const cell = xword.value.getCell()
  const isAcross = xword.value.isHoriz
  const num = isAcross ? cell.acrossNum : cell.downNum
  const entry =
    num != null ? (isAcross ? xword.value.across[num] : xword.value.down[num]) : undefined
  const txt = entry ? entry.txt : ''
  return {
    num: num,
    txt: txt,
    isAcross: isAcross,
  }
})
const showContextKey = computed(() => {
  return (
    clickedClue.value.prev + '|' + clickedClue.value.next + '|' + contextEnabled.value + '|' + false
  )
})
const acrossNum = computed(() => xword.value.getCell().acrossNum)
const downNum = computed(() => xword.value.getCell().downNum)

interface RawXwordHeader {
  id: string
  optionId?: string
  solution?: string[]
  clues?: { across: ClueMap; down: ClueMap }
  [key: string]: unknown
}

function fetchXword(): Promise<{
  title: string
  author: string
  editor: string
  createDate: string
  solution: string[]
  clues: { across: ClueMap; down: ClueMap }
  theme?: string
  note?: string
  shapeCells?: [number, number, string][]
  colorCells?: [number, number, string][]
}> {
  // TODO once a back end exists creat an endpoint of DB view to fetch this all in one go
  return new Promise((resolve, reject) => {
    fetch(`/json/xwords/headers.json`)
      .then((response) => {
        response.json().then((json: { headers: RawXwordHeader[] }) => {
          const xwordHeader = json.headers.find((h) => h.id === props.xwordId)
          if (!xwordHeader) {
            reject({ msg: `Failed To fetch Crossword with Id =[${props.xwordId}]` })
            return
          }
          const promises: Promise<void>[] = []

          // Fetch the Solution
          promises.push(
            new Promise((resolve1) => {
              fetch(`/json/xwords/solutions/${props.xwordId}.json`).then((response) => {
                response.json().then((json: { solution: string[] }) => {
                  xwordHeader.solution = json.solution
                  resolve1()
                })
              })
            }),
          )

          // Fetch the Clues
          promises.push(
            new Promise((resolve2) => {
              fetch(`/json/xwords/clues/${props.xwordId}.json`).then((response) => {
                response
                  .json()
                  .then(
                    (json: { across: Record<string, string>; down: Record<string, string> }) => {
                      // Preprocess clues into an obejct
                      const across: ClueMap = {}
                      const down: ClueMap = {}
                      for (const [key, txt] of Object.entries(json.across)) {
                        across[key] = { txt } as ClueMap[string]
                      }
                      for (const [key, txt] of Object.entries(json.down)) {
                        down[key] = { txt } as ClueMap[string]
                      }
                      xwordHeader.clues = { across, down }
                      resolve2()
                    },
                  )
              })
            }),
          )

          // Fetch the Options if specified
          if (xwordHeader.optionId) {
            promises.push(
              new Promise((resolve3) => {
                fetch(`/json/xwords/options/${xwordHeader.optionId}.json`).then((response) => {
                  response.json().then((json: Record<string, unknown>) => {
                    Object.assign(xwordHeader, json)
                    resolve3()
                  })
                })
              }),
            )
          }

          // Wait until all are done then return the processed xword
          Promise.all(promises).then(() => resolve(xwordHeader as never))
        })
      })
      .catch((e) => {
        console.error(e)
        reject({ msg: `Failed To fetch Crossword with Id =[${props.xwordId}]` })
      })
  })
}

function clear(clearType: 'flags' | 'wrong' | 'clue' | 'puzzle') {
  switch (clearType) {
    case 'puzzle':
      xword.value.clear(true, true, true)
      break
    case 'flags':
      xword.value.clear(true, false)
      break
    case 'wrong':
      xword.value.clear(false, true)
      break
    case 'clue':
      xword.value.clearClue()
      break
  }
  saveProgress()
}
function solve(solveType: 'cell' | 'clue' | 'puzzle') {
  switch (solveType) {
    case 'puzzle':
      console.log('[SOLVE] Puzzle')
      xword.value.solvePuzzle()
      break
    case 'clue':
      console.log('[SOLVE] Clue')
      xword.value.solveClue()
      break
    case 'cell':
      console.log('[SOLVE] Cell')
      xword.value.solveCurrentCell()
      break
  }
  saveProgress()
}
function updateShownWrong(cell: { r: number; c: number }) {
  xword.value.updateShownErrorFlag(cell.r, cell.c)
}
function saveProgress() {
  localStorage['xword:' + props.xwordId.toString()] = JSON.stringify(xword.value.saveData())
}
function useCachedOpt(cachedOpts: Record<string, unknown>, path: string[]) {
  let cachedOpt: unknown = cachedOpts
  let trueOpt: Record<string, unknown> = opts.value as unknown as Record<string, unknown>
  for (let i = 0; i < path.length; i++) {
    if (!cachedOpt) {
      return
    }
    cachedOpt = (cachedOpt as Record<string, unknown>)[path[i]!]
    if (i < path.length - 1) {
      trueOpt = trueOpt[path[i]!] as Record<string, unknown>
    }
  }
  trueOpt[path[path.length - 1]!] = cachedOpt
}
function setOption(p: SetOptionPayload) {
  let opt: Record<string, unknown> = opts.value as unknown as Record<string, unknown>
  for (let i = 0; i < p.optionPath.length - 1; i++) {
    opt = opt[p.optionPath[i]!] as Record<string, unknown>
  }
  opt[p.optionPath[p.optionPath.length - 1]!] = p.value
  if (!p.dontSave) {
    localStorage['xwordOpts'] = JSON.stringify(opts.value)
  }
}
function specialKeyboard(force = false) {
  const cell = xword.value.getCell()
  if (!cell.wasAutoSolved && (keyboardMasterOverride.value || cell.isSpecialInput || force)) {
    pseudoInput.value?.focus({ preventScroll: true })
  } else {
    pseudoInput.value?.blur()
  }
}
function executePress(ch: string, pressOpts?: Record<string, unknown>) {
  // All press/action handler
  if (ch.startsWith('$')) {
    forceSpecialKeyboard.value =
      pressOpts && pressOpts.forceSpecialKeyboard
        ? true
        : ch === '$BACKSPACE'
          ? forceSpecialKeyboard.value
          : false
    executeAction(ch, pressOpts)
  } else {
    xword.value.enterChar(ch, opts.value.navigation.autoSkipFilledCells)
  }

  // Bring Up keyboard if afterImage is soecial
  specialKeyboard(forceSpecialKeyboard.value)

  saveProgress()
}
function executeAction(actn: string, actionOpts?: Record<string, unknown>) {
  switch (actn) {
    case '$ARROWLEFT':
      xword.value.move({ r: 0, c: -1 })
      break
    case '$ARROWRIGHT':
      xword.value.move({ r: 0, c: 1 })
      break
    case '$ARROWDOWN':
      xword.value.move({ r: 1, c: 0 })
      break
    case '$ARROWUP':
      xword.value.move({ r: -1, c: 0 })
      break
    case '$SWITCHDIRECTION':
      xword.value.isHoriz = !xword.value.isHoriz
      break
    case '$SETDIRECTION':
      xword.value.isHoriz = actionOpts!.direction as boolean
      break
    case '$TAB':
      xword.value.moveClue(true)
      break
    case '$!TAB':
      xword.value.moveClue(false)
      break
    case '$SETPOSITION':
      xword.value.setPosition(actionOpts!.r as number, actionOpts!.c as number)
      break
    case '$FLAGCELL':
      xword.value.toggleCellFlag()
      break
    case '$REMOVESPECIALINPUT':
      // Only removes it if just created
      if (xword.value.getCell().isSpecialInput) {
        xword.value.specialInputIntegrity()
      }
      break
    case '$LEAVESPECIALINPUT':
      if (xword.value.getCell().isSpecialInput) {
        xword.value.incrementPosition(false)
      } else {
        executePress('$TAB')
      }
      break
    case '$SPECIALEDIT':
      xword.value.enableSpecialEdit()
      break
    case '$TOGGLESHOWCONTEXT': {
      const direction = actionOpts!.direction as 'across' | 'down'
      const number = actionOpts!.number as string
      clickedClue.value = xword.value[direction][number]!
      contextEnabled.value = !clickedClue.value.showContext
      clickedClue.value.showContext = contextEnabled.value
      break
    }
    case '$BACKSPACE':
      xword.value.backSpaceLogic()
      break
  }
}

onBeforeRouteLeave((_to, _from, next) => {
  saveProgress()
  next()
})

fetchXword().then((raw) => {
  xword.value = new Xword(
    raw.title,
    raw.author,
    raw.editor,
    raw.createDate,
    raw.solution,
    raw.clues.across,
    raw.clues.down,
    raw.theme,
    raw.note,
    { shapeCells: raw.shapeCells, colorCells: raw.colorCells },
  )
  const savedProgress = localStorage[`xword:${props.xwordId}`]
  if (savedProgress) {
    xword.value.reloadSavedData(JSON.parse(savedProgress))
  }
  const cachedOptsRaw = localStorage['xwordOpts']
  if (cachedOptsRaw) {
    const cachedOpts = JSON.parse(cachedOptsRaw)

    // To prevent stale opts in localStorage assign current opts with falues from cached ones
    useCachedOpt(cachedOpts, ['clues', 'showCluePanel'])
    useCachedOpt(cachedOpts, ['clues', 'contextOpt'])
    useCachedOpt(cachedOpts, ['clues', 'hideClueOpt'])
    useCachedOpt(cachedOpts, ['errors', 'showErrors'])
    useCachedOpt(cachedOpts, ['keyboard', 'showOnPageKeyboard'])
    useCachedOpt(cachedOpts, ['keyboard', 'enableNativeKeyboardToggle'])
    useCachedOpt(cachedOpts, ['navigation', 'autoSkipFilledCells'])
    useCachedOpt(cachedOpts, ['currentClue', 'loc'])
  }
  loadingMessage.value = undefined
  console.log(xword.value)
})
</script>

<template>
  <div id="crossword">
    <div v-if="loadingMessage">
      <LoadingSpinner :size="64" />
      <div>{{ loadingMessage }}</div>
    </div>
    <div v-else class="blk-container">
      <div style="height: 0; overflow: hidden">
        <input
          type="text"
          ref="pseudoInput"
          style="opacity: 0"
          purpose="To trick the phone into bringing up its keyboard"
        />
      </div>
      <XwordHeader
        :title="xword.title"
        :author="xword.author"
        :publishDate="xword.publishDate"
        :timer="xword.timer"
        :themeExp="xword.theme"
        :note="xword.note"
        :completed="xword.completed"
        @flagCell="executePress('$FLAGCELL')"
        @specialEdit="executePress('$SPECIALEDIT')"
        @toggleNativeKeyboard="
          keyboardMasterOverride = !keyboardMasterOverride;
          specialKeyboard()
        "
        @setOption="setOption"
        @disableNativeKeyboard="
          keyboardMasterOverride = false;
          specialKeyboard()
        "
        @defaultSettings="opts = defaultOpts(true)"
        @clear="clear"
        @solve="solve"
        @saveProgress="saveProgress"
        :nativeKeyboardEnabled="keyboardMasterOverride"
        :opts="opts"
      />
      <XwordStatBanner
        v-show="xword.filled"
        :isCompleted="xword.completed"
        :showErrors="opts.errors.showErrors"
        :stats="xword.stats"
        :statData="xword.statData"
        @setOption="setOption"
        @clear="clear"
        @solve="solve"
      />
      <XwordCurrentClue
        v-show="opts.currentClue.loc === 'top'"
        :clue="currentClue"
        @executePress="executePress"
      />
      <XwordPuzzle
        :puzzle="xword.puzzle"
        :r="xword.r"
        :c="xword.c"
        :isHoriz="xword.isHoriz"
        :acrossNum="acrossNum"
        :downNum="downNum"
        :showErrors="opts.errors.showErrors"
        @executePress="executePress"
        @updateShownWrong="updateShownWrong"
      />
      <XwordCurrentClue
        v-show="opts.currentClue.loc === 'bottom'"
        :clue="currentClue"
        @executePress="executePress"
      />
      <XwordKeyboard v-show="opts.keyboard.showOnPageKeyboard" @executePress="executePress" />
      <XwordCluePanel
        v-if="opts.clues.showCluePanel"
        :acrossClueObj="xword.across"
        :downClueObj="xword.down"
        :r="xword.r"
        :c="xword.c"
        :curCellValue="xword.getCell().entry"
        :curCellFlag="xword.getCell().flag"
        :showContextKey="showContextKey"
        :acrossNum="acrossNum"
        :downNum="downNum"
        :puzzleIsHoriz="xword.isHoriz"
        :opts="opts"
        @executePress="executePress"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#crossword {
  .blk-container {
    max-width: 500px;
    width: 100%;
  }
}
</style>
