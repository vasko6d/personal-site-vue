<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

interface KeyBtn {
  disp: string
  val: string
  isActive: number
  isFA?: boolean
}

const emit = defineEmits<{
  executePress: [ch: string, opts?: Record<string, unknown>]
}>()

const keyLayout = ref<KeyBtn[][]>([])
const invKeyLayout = ref<Record<string, { r: number; c: number }>>({})

function createQwerty(
  includeBackspace = true,
): [KeyBtn[][], Record<string, { r: number; c: number }>] {
  const retArr: KeyBtn[][] = []
  const retInv: Record<string, { r: number; c: number }> = {}
  const qwerty = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
  for (let i = 0; i < qwerty.length; i++) {
    const row = qwerty[i]!
    const retRow: KeyBtn[] = []
    for (let j = 0; j < row.length; j++) {
      const ch = row[j]!
      retRow.push({
        disp: ch,
        val: ch,
        isActive: 0,
      })
      retInv[ch] = { r: i, c: j }
    }
    retArr.push(retRow)
  }
  if (includeBackspace) {
    retArr[2]!.push({
      disp: 'fas fa-backspace',
      isFA: true,
      val: '$BACKSPACE',
      isActive: 0,
    })
    retInv['BACKSPACE'] = { r: 2, c: retArr[2]!.length - 1 }
  }
  return [retArr, retInv]
}

function executePress(ch: string, opts?: Record<string, unknown>) {
  emit('executePress', ch, opts)
}

function flashBtn(btn: KeyBtn, activeType = 1) {
  if (activeType === 2) {
    btn.isActive = activeType
    setTimeout(() => {
      btn.isActive = 0
    }, 200)
  } else {
    btn.isActive = 0
  }
}

function startHandler(key: KeyBtn) {
  return (e: Event) => {
    e.preventDefault()
    key.isActive = 1
  }
}
function abortHandler(key: KeyBtn) {
  return (e: Event) => {
    e.preventDefault()
    key.isActive = 0
  }
}
function endHandler(key: KeyBtn) {
  return (e: Event) => {
    if (key.isActive === 1) {
      e.preventDefault()
      flashBtn(key)
      executePress(key.val)
    }
  }
}

function keydownFxn(e: KeyboardEvent) {
  const ch = e.key.toUpperCase()
  if (ch.match(/^[^\s]$/)) {
    // Because of my 'psuedo-input" i need to disable most defautls
    // I manually exclude "Ctrl-Shift-J" which brings up browser console
    // but there is probably a more accepted way to do this.
    if (!(e.shiftKey && e.ctrlKey && ch === 'J')) {
      e.preventDefault()
    }

    executePress(ch)
    if (ch.match(/^[A-Z]$/)) {
      const pos = invKeyLayout.value[ch]!
      flashBtn(keyLayout.value[pos.r]![pos.c]!, 2)
    }
  } else {
    e.preventDefault()
    switch (ch) {
      case 'ARROWLEFT':
      case 'ARROWRIGHT':
      case 'ARROWDOWN':
      case 'ARROWUP':
        executePress('$' + ch)
        break
      case 'TAB':
        if (e.shiftKey) {
          executePress('$!' + ch)
        } else {
          executePress('$' + ch)
        }
        break
      case 'ENTER':
        executePress('$LEAVESPECIALINPUT')
        break
      case 'ESCAPE':
        executePress('$REMOVESPECIALINPUT')
        break
      case ' ':
        executePress('$SWITCHDIRECTION')
        break
      case 'BACKSPACE': {
        executePress('$' + ch)
        const pos = invKeyLayout.value['BACKSPACE']!
        flashBtn(keyLayout.value[pos.r]![pos.c]!, 2)
        break
      }
    }
  }
}

onMounted(() => {
  ;[keyLayout.value, invKeyLayout.value] = createQwerty()
  window.addEventListener('keydown', keydownFxn)
  nextTick(() => {
    const rows = document.getElementsByClassName('key-row')
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]!
      const keys = row.getElementsByClassName('key')
      for (let keynum = 0; keynum < keys.length; keynum++) {
        const keyel = keys[keynum]!
        const keybtn = keyLayout.value[r]![keynum]!
        keyel.addEventListener('mousedown', startHandler(keybtn))
        keyel.addEventListener('touchstart', startHandler(keybtn))
        keyel.addEventListener('mouseup', endHandler(keybtn))
        keyel.addEventListener('touchend', endHandler(keybtn))
        keyel.addEventListener('mouseleave', abortHandler(keybtn))
        keyel.addEventListener('touchmove', abortHandler(keybtn))
        keyel.addEventListener('touchcancel', abortHandler(keybtn))
      }
    }
  })
})
onUnmounted(() => {
  window.removeEventListener('keydown', keydownFxn)
})
</script>

<template>
  <div class="keyboard-container bg1">
    <div class="key-row" ref="row" v-for="(keyRow, rIndex) in keyLayout" :key="rIndex">
      <div
        ref="key"
        :class="[
          'key',
          {
            'key-t': keyBtn.isActive === 1,
            'key-a': keyBtn.isActive === 2,
            'key-wide': keyBtn.val === '$BACKSPACE',
          },
        ]"
        v-for="(keyBtn, cIndex) in keyRow"
        :key="cIndex"
      >
        <i :class="keyBtn.isFA ? keyBtn.disp : ''">
          {{ keyBtn.isFA ? '' : keyBtn.disp }}
        </i>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
.keyboard-container {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: none;
  margin-bottom: 0.5em;
  .key-row {
    display: flex;
    justify-content: center;
    height: 45px;
    margin-left: 3px;
    margin-right: 3px;
    .key {
      flex-grow: 1;
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      flex-basis: 30px;
      text-align: center;
      margin: 3px;
      padding-top: 5px;
      border-radius: 0.35em;
      height: 40px;
      cursor: pointer;
    }
    .key-wide {
      flex-basis: 60px;
    }
    .key-t {
      z-index: 9000;
      height: 70px;
      box-shadow: 0px 0px 1px 0px #000000; /* Standard */
      margin-top: -27px;
    }
  }
}
</style>
