<script setup lang="ts">
import XwordClues from '@/components/crossword/XwordClues.vue'
import type { ClueMap } from './Xword'

interface CluePanelOpts {
  clues: { contextOpt: string; hideClueOpt: string }
  errors: { showErrors: boolean }
}

defineProps<{
  acrossClueObj: ClueMap
  downClueObj: ClueMap
  opts: CluePanelOpts
  r: number
  c: number
  acrossNum: number | null
  downNum: number | null
  curCellValue?: string
  showContextKey?: string
  curCellFlag?: boolean
  puzzleIsHoriz: boolean
}>()

const emit = defineEmits<{
  executePress: [ch: string, opts?: Record<string, unknown>]
}>()

function executePress(ch: string, opts?: Record<string, unknown>) {
  emit('executePress', ch, opts)
}
</script>

<template>
  <div id="clue-panel" class="bg1">
    <div id="clue-head">Clue Panel</div>
    <XwordClues
      :clueObj="acrossClueObj"
      :r="r"
      :c="c"
      :acrossNum="acrossNum"
      :downNum="downNum"
      :curCellValue="curCellValue"
      :showContextKey="showContextKey"
      :curCellFlag="curCellFlag"
      direction="across"
      :puzzleIsHoriz="puzzleIsHoriz"
      :contextOpt="opts.clues.contextOpt"
      :hideClueOpt="opts.clues.hideClueOpt"
      :showErrors="opts.errors.showErrors"
      @executePress="executePress"
    />
    <XwordClues
      :clueObj="downClueObj"
      :r="r"
      :c="c"
      :acrossNum="acrossNum"
      :downNum="downNum"
      :curCellValue="curCellValue"
      :showContextKey="showContextKey"
      :curCellFlag="curCellFlag"
      direction="down"
      :puzzleIsHoriz="puzzleIsHoriz"
      :contextOpt="opts.clues.contextOpt"
      :hideClueOpt="opts.clues.hideClueOpt"
      :showErrors="opts.errors.showErrors"
      @executePress="executePress"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/wrapper.scss';
#clue-panel {
  #clue-head {
    font-weight: bold;
    font-size: 17px;
  }
}
</style>
