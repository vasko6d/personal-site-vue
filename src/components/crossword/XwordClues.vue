<script setup lang="ts">
import { computed, ref } from 'vue'
import XwordClueContext from '@/components/crossword/XwordClueContext.vue'
import type { Clue, ClueMap } from './Xword'

const props = defineProps<{
  clueObj: ClueMap
  r: number
  c: number
  acrossNum: number | null
  downNum: number | null
  direction: string
  curCellValue?: string
  contextOpt: string
  hideClueOpt: string
  showContextKey?: string
  curCellFlag?: boolean
  puzzleIsHoriz: boolean
  showErrors: boolean
}>()

const emit = defineEmits<{
  executePress: [ch: string, opts?: Record<string, unknown>]
}>()

const showClues = ref(false)

const clueHead = computed(() => props.direction.charAt(0).toUpperCase() + props.direction.slice(1))

function isActive(num: string): boolean {
  return props.puzzleIsHoriz
    ? props.direction === 'across' && props.acrossNum == Number(num)
    : props.direction === 'down' && props.downNum == Number(num)
}
function contextClick(r: number, c: number) {
  emit('executePress', '$SETPOSITION', { r: r, c: c, forceSpecialKeyboard: true })
  emit('executePress', '$SETDIRECTION', {
    direction: props.direction === 'across',
    forceSpecialKeyboard: true,
  })
}
function showClue(clue: Clue): boolean {
  let ret = props.hideClueOpt === 'never'
  ret = ret || (props.hideClueOpt === 'onFill' && !clue.filled)
  ret = ret || (props.hideClueOpt === 'onCorrect' && !clue.correct)
  return ret
}
function relevantClueCount(): string {
  const numClues = Object.keys(props.clueObj).length
  let ret = numClues.toString() + ' total'
  if (props.hideClueOpt != 'never') {
    let cnt = 0
    let suffix = ' filled'
    if (props.hideClueOpt === 'onFill') {
      for (const k of Object.keys(props.clueObj)) {
        cnt += props.clueObj[k]!.filled ? 1 : 0
      }
    } else if (props.hideClueOpt == 'onCorrect') {
      for (const k of Object.keys(props.clueObj)) {
        cnt += props.clueObj[k]!.correct ? 1 : 0
      }
      suffix = ' correct'
    }
    ret = cnt.toString() + '/' + numClues.toString() + suffix
  }
  return ret
}
</script>

<template>
  <div class="clues">
    <div class="clue-h icn" @click="showClues = !showClues">
      {{ clueHead }}&nbsp;({{ relevantClueCount() }})
      <i
        :class="{
          fas: true,
          'fa-angle-down': !showClues,
          'fa-angle-up': showClues,
        }"
      ></i>
    </div>
    <div class="clue-list" v-if="showClues">
      <div v-for="(clue, num) in clueObj" :class="['clue', { active: isActive(num) }]" :key="num">
        <div v-if="showClue(clue)">
          <div class="clue-num-txt">
            <div>{{ num }}.</div>
            <div
              class="clue-txt"
              @click="
                emit('executePress', '$TOGGLESHOWCONTEXT', { direction: direction, number: num })
              "
            >
              {{ clue.txt }}
            </div>
          </div>
          <XwordClueContext
            v-if="contextOpt === 'always' || (contextOpt === 'toggle' && clue.showContext)"
            :context="clue.ctx"
            :xr="r"
            :xc="c"
            :xAcrossNum="acrossNum ?? -1"
            :xDownNum="downNum ?? -1"
            :xIsHoriz="puzzleIsHoriz"
            :curCellValue="curCellValue"
            :curCellFlag="curCellFlag"
            :showContextKey="showContextKey"
            :showErrors="showErrors"
            @contextClick="contextClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
.clues {
  text-align: left;
  max-width: 650px;
  .clue-h {
    text-align: center;
    font-size: 17px;
    margin-bottom: 0px;
  }
  .clue-list {
    width: calc(100% - 50px);
    margin-left: 50px;
    ol {
      font-size: 18px;
      font-weight: bold;
      .clue {
        .clue-txt {
          font-size: 16px;
          font-weight: normal;
          cursor: pointer;
        }
      }
    }
  }
  .clue-num-txt {
    display: flex;
    gap: 5px;
    div:first-of-type {
      font-weight: bold;
    }
  }
}
</style>
