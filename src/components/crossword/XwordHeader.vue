<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Timer from '@/utils/webgl/Timer'
import XwordHelp from '@/components/crossword/XwordHelp.vue'
import XwordSettings from '@/components/crossword/XwordSettings.vue'
import XwordTools from '@/components/crossword/XwordTools.vue'
import type { SetOptionPayload, XwordOpts } from './types'

const props = defineProps<{
  title: string
  author: string
  note?: string
  themeExp?: string
  completed: boolean
  nativeKeyboardEnabled: boolean
  publishDate: Date
  opts: XwordOpts
  timer: Timer
}>()

const emit = defineEmits<{
  flagCell: []
  specialEdit: []
  toggleNativeKeyboard: []
  setOption: [payload: SetOptionPayload]
  disableNativeKeyboard: []
  defaultSettings: []
  clear: [type: 'flags' | 'wrong' | 'clue' | 'puzzle']
  solve: [type: 'cell' | 'clue' | 'puzzle']
  saveProgress: []
}>()

const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const showNote = ref(false)
const showTheme = ref(false)
const showHelp = ref(false)
const showSettings = ref(false)
const showTools = ref(false)

const formattedTime = computed(() => {
  const hh = (hours.value < 10 ? '0' : '') + hours.value.toString()
  const mm = (minutes.value < 10 ? '0' : '') + minutes.value.toString()
  const ss = (seconds.value < 10 ? '0' : '') + seconds.value.toString()
  return hh + ':' + mm + ':' + ss
})

function calcTime() {
  const sec = props.timer.getTimeSec(true)
  hours.value = Math.floor(sec / (60 * 24)) % 100
  minutes.value = Math.floor(sec / 60) % 60
  seconds.value = sec % 60
}

let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  interval = setInterval(() => {
    calcTime()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(interval)
})

function setOption(payload: SetOptionPayload) {
  emit('setOption', payload)
}
function setNativeKeyboardOption(payload: SetOptionPayload) {
  emit('setOption', payload)
  emit('disableNativeKeyboard')
}
function clear(payload: 'flags' | 'wrong' | 'clue' | 'puzzle') {
  modalToggle(false, 'showTools')
  emit('clear', payload)
}
function solve(payload: 'cell' | 'clue' | 'puzzle') {
  modalToggle(false, 'showTools')
  emit('solve', payload)
}
function modalToggle(b: boolean, propName: 'showTools' | 'showSettings' | 'showHelp') {
  if (propName === 'showTools') showTools.value = b
  else if (propName === 'showSettings') showSettings.value = b
  else showHelp.value = b
  document.documentElement.style.overflow = b ? 'hidden' : 'auto'
}
</script>

<template>
  <div id="x-head" class="bg1">
    <XwordHelp v-if="showHelp" @close="modalToggle(false, 'showHelp')" />
    <XwordSettings
      v-if="showSettings"
      @close="modalToggle(false, 'showSettings')"
      @setOption="setOption"
      @setNativeKeyboardOption="setNativeKeyboardOption"
      @defaultSettings="$emit('defaultSettings')"
      :opts="opts"
    />
    <XwordTools
      v-if="showTools"
      @close="modalToggle(false, 'showTools')"
      @clear="clear"
      @solve="solve"
      @saveProgress="
        $emit('saveProgress');
        modalToggle(false, 'showTools')
      "
    />
    <div class="info-nav">
      <div class="right-close">
        <i class="fas fa-times icn" @click="$router.push('/crossword/search')"></i>
      </div>
      <div class="info">
        <h2>
          {{ title }}&nbsp;
          <i
            v-show="note"
            @click="showNote = !showNote"
            :class="{
              icn: true,
              fas: true,
              'fa-angle-down': !showNote,
              'fa-angle-up': showNote,
            }"
          ></i>
        </h2>
        <div v-show="showNote" class="note">
          <strong>Note from author :</strong>
          {{ note }}
        </div>
        <div>by {{ author }}, {{ publishDate.toDateString() }}</div>
        <div v-show="completed && themeExp" class="note">
          <strong>
            Theme Explanation :&nbsp;
            <i
              @click="showTheme = !showTheme"
              :class="{
                'icn fas fa-ellipsis-h': !showTheme,
              }"
            ></i>
          </strong>
          <span v-show="showTheme" @click="showTheme = !showTheme" style="cursor: pointer">{{
            themeExp
          }}</span>
        </div>
      </div>
    </div>
    <div class="tool-bar">
      <div class="left">
        <div class="left-timer">{{ formattedTime }}</div>
      </div>
      <div class="middle"></div>
      <div class="right">
        <span v-show="opts.keyboard.enableNativeKeyboardToggle">
          <i
            :class="['icn', 'fas', 'fa-keyboard', { enab: nativeKeyboardEnabled }]"
            @click="$emit('toggleNativeKeyboard')"
          ></i
          >|
        </span>
        <i class="icn fas fa-pen-square" @click="$emit('specialEdit')"></i>|
        <i class="icn fas fa-flag" @click="$emit('flagCell')"></i>|
        <i class="icn fas fa-tools" @click="modalToggle(true, 'showTools')"></i>
        |
        <i class="icn fas fa-cogs" @click="modalToggle(true, 'showSettings')"></i>
        |
        <i class="icn fas fa-question-circle" @click="modalToggle(true, 'showHelp')"></i>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#x-head {
  .info-nav {
    display: flex;
    justify-content: space-between;
    position: relative;
    .info {
      flex-grow: 1;
      margin-left: 4%;
      margin-right: 4%;
      .note {
        text-align: left;
        margin-left: 7%;
        margin-right: 7%;
        font-size: 0.85em;
      }
    }
  }
  .right-close {
    position: absolute;
    right: 0;
    margin-right: 10px;
    cursor: pointer;
  }
  .tool-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 3px;
    padding-left: 10px;
    padding-right: 10px;
    .middle {
      flex-grow: 1;
    }
    .icn {
      font-size: 20px;
      margin-left: 4px;
      margin-right: 4px;
    }
  }
  .left-timer {
    font-family: 'Lucida Console', Monaco, monospace;
  }
}
</style>
