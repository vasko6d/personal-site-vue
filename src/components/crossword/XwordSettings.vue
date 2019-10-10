<template>
  <div id="xword-opts">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="header">
                <h2>
                  Settings + Tools&nbsp;
                  <i class="fas fa-window-close" @click="$emit('close')"></i>
                </h2>
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                <h2 @click="showTools = !showTools">
                  Tools&nbsp;
                  <i
                    :class="[
                      'fas',
                      { 'fa-caret-down': !showTools, 'fa-caret-up': showTools }
                    ]"
                  ></i>
                </h2>
                <transition name="fade">
                  <div class="collapse-opts" v-if="showTools">
                    <h4><i class="fas fa-caret-right"></i>&nbsp;Clear</h4>
                    <div class="tool-btn danger">
                      <i class="far fa-trash-alt"></i>&nbsp;Clear all flags
                    </div>
                    <div class="tool-btn danger">
                      <i class="far fa-trash-alt"></i>&nbsp;Clear wrong entries
                    </div>
                    <div class="tool-btn danger">
                      <i class="far fa-trash-alt"></i>&nbsp;Clear current clue
                    </div>
                    <div class="tool-btn danger">
                      <i class="far fa-trash-alt"></i>&nbsp;Clear entire puzzle
                    </div>
                    <h4><i class="fas fa-caret-right"></i>&nbsp;Solve</h4>
                    <div class="tool-btn safe">
                      <i class="fas fa-clipboard-check"></i>&nbsp;Submit for
                      grading
                    </div>
                    <div class="tool-btn safe">
                      <i class="far fa-check-square"></i>&nbsp;Solve cell
                    </div>
                    <div class="tool-btn safe">
                      <i class="far fa-check-square"></i>&nbsp;Solve clue
                    </div>
                    <div class="tool-btn safe">
                      <i class="far fa-check-square"></i>&nbsp;Solve entire
                      puzzle
                    </div>
                  </div>
                </transition>
                <h2 @click="showSettings = !showSettings">
                  Settings&nbsp;
                  <i
                    :class="[
                      'fas',
                      {
                        'fa-caret-down': !showSettings,
                        'fa-caret-up': showSettings
                      }
                    ]"
                  ></i>
                </h2>
                <transition name="fade">
                  <div class="collapse-opts" v-if="showSettings">
                    <h4><i class="fas fa-caret-right"></i>&nbsp;General</h4>
                    <div
                      class="tool-btn danger"
                      @click="$emit('defaultSettings')"
                    >
                      <i class="far fa-trash-alt"></i>&nbsp;Reset to default
                    </div>
                    <font-awesome-check
                      :enabled="showErrors"
                      desc="Show errors"
                      @toggle="
                        $emit('setOption', {
                          optionPath: ['errors', 'showErrors'],
                          value: !showErrors
                        })
                      "
                    />
                    <font-awesome-check
                      :enabled="autoSkipFilledCells"
                      desc="Skip over filled cells when moving/entering"
                      @toggle="
                        $emit('setOption', {
                          optionPath: ['navigation', 'autoSkipFilledCells'],
                          value: !autoSkipFilledCells
                        })
                      "
                    />
                    <font-awesome-check
                      :enabled="showOnPageKeyboard"
                      desc="Show on-page keyboard"
                      @toggle="
                        $emit('setOption', {
                          optionPath: ['keyboard', 'showOnPageKeyboard'],
                          value: !showOnPageKeyboard
                        })
                      "
                    />
                    <h4><i class="fas fa-caret-right"></i>&nbsp;Clue Panel</h4>
                    <font-awesome-check
                      :enabled="showCluePanel"
                      desc="Show Clue Panel"
                      @toggle="
                        $emit('setOption', {
                          optionPath: ['clues', 'showCluePanel'],
                          value: !showCluePanel
                        })
                      "
                    />
                    <transition name="fade">
                      <div class="collapse-opts" v-if="showCluePanel">
                        <div class="choice-opt">
                          <h4>Clue Context</h4>
                          <div v-for="opt in contextOpts" :key="opt.id">
                            <font-awesome-check
                              :enabled="opt.val === currentContextOpt"
                              :desc="opt.name"
                              @toggle="
                                $emit('setOption', {
                                  optionPath: ['clues', 'contextOpt'],
                                  value: opt.val
                                })
                              "
                            />
                          </div>
                        </div>
                        <div class="choice-opt">
                          <h4>Clue Visibility</h4>
                          <div v-for="opt in hideClueOpts" :key="opt.id">
                            <font-awesome-check
                              :enabled="opt.val === currentHideClueOpt"
                              :desc="opt.name"
                              @toggle="
                                $emit('setOption', {
                                  optionPath: ['clues', 'hideClueOpt'],
                                  value: opt.val
                                })
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>
                </transition>
              </slot>
            </div>
            <div class="modal-footer">
              <slot name="footer">
                <h2>
                  <i class="fas fa-check-square" @click="$emit('close')"></i>
                </h2>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import FontAwesomeCheck from "@/components/FontAwesomeCheck.vue";
export default {
  name: "XwordSettingsModal",
  components: {
    FontAwesomeCheck
  },
  props: {
    showOnPageKeyboard: Boolean,
    showErrors: Boolean,
    showCluePanel: Boolean,
    autoSkipFilledCells: Boolean,
    contextOpts: Array,
    currentContextOpt: String,
    hideClueOpts: Array,
    currentHideClueOpt: String
  },
  data() {
    return {
      showSettings: false,
      showTools: true
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/modal-shared.scss";
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
    max-height: 400px;
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
