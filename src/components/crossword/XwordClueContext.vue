<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { PuzzleCell } from './Xword'

defineProps<{
  context: PuzzleCell[]
  xr: number
  xc: number
  xAcrossNum: number
  xDownNum: number
  xIsHoriz: boolean
  curCellFlag?: boolean
  curCellValue?: string
  showContextKey?: string
  showErrors: boolean
}>()

const emit = defineEmits<{
  contextClick: [r: number, c: number]
}>()

const halfSecs = ref(0)

const flashDash = computed(() => (halfSecs.value % 2 === 0 ? '_' : '&nbsp;'))

let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  interval = setInterval(() => {
    halfSecs.value = (halfSecs.value + 1) % 100
  }, 500)
})
onUnmounted(() => {
  clearInterval(interval)
})

function clickFxn(r: number, c: number) {
  emit('contextClick', r, c)
}
</script>

<template>
  <div class="clue-ctx">
    <div class="c-wrap">
      <div class="p-row">
        <div
          class="p-cell"
          v-for="(cell, index) in context"
          :key="index"
          @click="clickFxn(cell.r, cell.c)"
          v-tooltip="{
            content: cell.entry + flashDash,
            show: xr === cell.r && xc === cell.c && cell.isSpecialInput,
            trigger: 'manual',
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
                    active: xIsHoriz ? xAcrossNum === cell.acrossNum : xDownNum === cell.downNum,
                    exact: xr === cell.r && xc === cell.c,
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
  </div>
</template>

<style lang="scss" scoped>
.clue-ctx {
  @import '@/assets/styles/xword-puzzle.scss';
  .p-row {
    .p-cell {
      flex-grow: 1;
      flex-shrink: 1;
      max-width: 3ch;
      .black,
      .white,
      .gray {
        .cell-wrapper {
          .entry {
            font-size: 75%;
            width: 90%;
            margin: auto;
            margin-bottom: -0.5ch;
            text-align: center;
          }
        }
      }
    }
    margin-right: 10px;
  }
  margin-bottom: 0.5em;
}
</style>
