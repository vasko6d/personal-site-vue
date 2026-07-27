<script setup lang="ts">
import FontAwesomeCheck from '@/components/FontAwesomeCheck.vue'
import type { SetOptionPayload, XwordOpts } from './types'

defineProps<{
  opts: XwordOpts
}>()

defineEmits<{
  close: []
  defaultSettings: []
  setOption: [payload: SetOptionPayload]
  setNativeKeyboardOption: [payload: SetOptionPayload]
}>()
</script>

<template>
  <div id="xword-opts">
    <!-- toggled by the parent's v-if="showSettings", not a v-if/v-show in here -->
    <!-- toggled by the parent's v-if="showSettings", not a v-if/v-show in here -->
    <!-- eslint-disable vue/require-toggle-inside-transition -->
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container" ref="settingsModal">
            <div class="modal-header">
              <slot name="header">
                <h2>
                  Settings&nbsp;
                  <i class="fas fa-window-close icn" @click="$emit('close')"></i>
                </h2>
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                <h4><i class="fas fa-caret-right"></i>&nbsp;General</h4>
                <div class="tool-btn danger" @click="$emit('defaultSettings')">
                  <i class="far fa-trash-alt"></i>&nbsp;Reset to default
                </div>
                <FontAwesomeCheck
                  :enabled="opts.errors.showErrors"
                  desc="Show errors"
                  @toggle="
                    $emit('setOption', {
                      optionPath: ['errors', 'showErrors'],
                      value: !opts.errors.showErrors,
                    })
                  "
                />
                <FontAwesomeCheck
                  :enabled="opts.navigation.autoSkipFilledCells"
                  desc="Skip over filled cells when typing"
                  @toggle="
                    $emit('setOption', {
                      optionPath: ['navigation', 'autoSkipFilledCells'],
                      value: !opts.navigation.autoSkipFilledCells,
                    })
                  "
                />
                <FontAwesomeCheck
                  :enabled="opts.keyboard.showOnPageKeyboard"
                  desc="Show on-page keyboard"
                  @toggle="
                    $emit('setOption', {
                      optionPath: ['keyboard', 'showOnPageKeyboard'],
                      value: !opts.keyboard.showOnPageKeyboard,
                    })
                  "
                />
                <FontAwesomeCheck
                  :enabled="opts.keyboard.enableNativeKeyboardToggle"
                  desc="Enable toggle for the native keyboard"
                  @toggle="
                    $emit('setNativeKeyboardOption', {
                      optionPath: ['keyboard', 'enableNativeKeyboardToggle'],
                      value: !opts.keyboard.enableNativeKeyboardToggle,
                    })
                  "
                />
                <h4><i class="fas fa-caret-right"></i>&nbsp;Clue Panel</h4>
                <FontAwesomeCheck
                  :enabled="opts.clues.showCluePanel"
                  desc="Show Clue Panel"
                  @toggle="
                    $emit('setOption', {
                      optionPath: ['clues', 'showCluePanel'],
                      value: !opts.clues.showCluePanel,
                    })
                  "
                />
                <transition name="fade">
                  <div class="collapse-opts" v-if="opts.clues.showCluePanel">
                    <div class="choice-opt">
                      <h4>Clue Context</h4>
                      <div v-for="opt in opts.clues.contextOpts" :key="opt.val">
                        <FontAwesomeCheck
                          :enabled="opt.val === opts.clues.contextOpt"
                          :desc="opt.name"
                          @toggle="
                            $emit('setOption', {
                              optionPath: ['clues', 'contextOpt'],
                              value: opt.val,
                            })
                          "
                        />
                      </div>
                    </div>
                    <div class="choice-opt">
                      <h4>Clue Visibility</h4>
                      <div v-for="opt in opts.clues.hideClueOpts" :key="opt.val">
                        <FontAwesomeCheck
                          :enabled="opt.val === opts.clues.hideClueOpt"
                          :desc="opt.name"
                          @toggle="
                            $emit('setOption', {
                              optionPath: ['clues', 'hideClueOpt'],
                              value: opt.val,
                            })
                          "
                        />
                      </div>
                    </div>
                  </div>
                </transition>
                <h4><i class="fas fa-caret-right"></i>&nbsp;Current Clue</h4>
                <div class="choice-opt">
                  <h4>Location</h4>
                  <div v-for="opt in opts.currentClue.locOpts" :key="opt.val">
                    <FontAwesomeCheck
                      :enabled="opt.val === opts.currentClue.loc"
                      :desc="opt.name"
                      @toggle="
                        $emit('setOption', { optionPath: ['currentClue', 'loc'], value: opt.val })
                      "
                    />
                  </div>
                </div>
              </slot>
            </div>
            <div class="modal-footer">
              <slot name="footer">
                <h2>
                  <i class="fas fa-check-square icn" @click="$emit('close')"></i>
                </h2>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- eslint-enable vue/require-toggle-inside-transition -->
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/modal-shared.scss';
#xword-opts {
  .modal-body {
    text-align: left;
    h2 {
      cursor: pointer;
      text-align: center;
    }
    .choice-opt {
      margin-left: 5%;
    }
  }
  .tool-btn {
    color: gray;
    cursor: pointer;
    margin: 2px;
    margin-left: 5%;
    display: inline-block;
    width: 51%;
  }
  .note {
    margin-left: 5%;
    font-size: 14px;
  }
  .danger {
    &:hover {
      color: red;
    }
  }
  .safe {
    &:hover {
      color: green;
    }
  }
  .collapse-opts {
    max-height: 450px;
    overflow: hidden;
  }
  .fade-enter-active {
    transition: max-height 0.4s ease-in;
  }
  .fade-leave-active {
    transition: max-height 0.4s ease-out;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    max-height: 0;
  }
}
</style>
