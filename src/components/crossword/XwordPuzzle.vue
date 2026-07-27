<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { PuzzleCell } from './Xword'

const props = defineProps<{
  puzzle: PuzzleCell[][]
  r: number
  c: number
  isHoriz: boolean
  acrossNum: number | null
  downNum: number | null
  showErrors: boolean
}>()

const emit = defineEmits<{
  executePress: [ch: string, opts?: Record<string, unknown>]
  updateShownWrong: [cell: PuzzleCell]
}>()

const halfSecs = ref(0)

const flashDash = computed(() => (halfSecs.value % 2 === 0 ? '_' : ' '))

let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  interval = setInterval(() => {
    halfSecs.value = (halfSecs.value + 1) % 100
  }, 500)
})
onUnmounted(() => {
  clearInterval(interval)
})

function isInput(color: string): boolean {
  return color != 'black'
}
function isActive(cell: PuzzleCell): boolean {
  return props.isHoriz ? props.acrossNum === cell.acrossNum : props.downNum === cell.downNum
}
function isExact(r: number, c: number): boolean {
  return r === props.r && c == props.c
}
function clickFxn(r: number, c: number, color: string) {
  if (isInput(color)) {
    if (isExact(r, c)) {
      emit('executePress', '$SWITCHDIRECTION')
    } else {
      emit('executePress', '$SETPOSITION', { r: r, c: c })
    }
  }
}
</script>

<template>
  <div id="puzzle">
    <div class="p-row" v-for="(row, r) in puzzle" :key="r">
      <div
        class="p-cell"
        v-for="(cell, c) in row"
        :key="c"
        @click="clickFxn(r, c, cell.color)"
        v-tooltip="{
          content: cell.entry + flashDash,
          show: isExact(r, c) && cell.isSpecialInput,
          trigger: 'manual',
          html: true,
        }"
      >
        <div class="color-base" :class="[cell.color]">
          <div
            :class="[
              {
                flagged: cell.flag,
                autosolved: cell.wasAutoSolved,
                wrong: showErrors && cell.wrong && cell.entry,
              },
            ]"
          >
            <div
              :class="[
                {
                  active: isActive(cell),
                  exact: isExact(r, c),
                },
              ]"
            >
              <div class="cell-wrapper">
                <span class="numbering">{{ cell.cellNum }}</span>
                <div class="entry">
                  <span v-if="!cell.isSpecialInput">{{ cell.entry }}</span>
                  <i v-else class="fas fa-comment-dots"></i>
                </div>
                <div class="circle" v-show="cell.shape === 'circle'"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/xword-puzzle';

#puzzle {
  @include xword-puzzle.puzzle-grid-styles;
  margin-bottom: 0.5em;
}
</style>
