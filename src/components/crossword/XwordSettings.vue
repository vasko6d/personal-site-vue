<template>
  <div id="xword-opts">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="header">
                <h2>
                  Settings&nbsp;
                  <i class="fas fa-window-close" @click="$emit('close')"></i>
                </h2>
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
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
                  <div class="clue-panel-opts" v-if="showCluePanel">
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
                <h4><i class="fas fa-caret-right"></i>&nbsp;Keyboard</h4>
                <font-awesome-check
                  :enabled="showOnPageKeyboard"
                  desc="On-page keyboard"
                  @toggle="
                    $emit('setOption', {
                      optionPath: ['keyboard', 'showOnPageKeyboard'],
                      value: !showOnPageKeyboard
                    })
                  "
                />
                <h4><i class="fas fa-caret-right"></i>&nbsp;Errors</h4>
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
    contextOpts: Array,
    currentContextOpt: String,
    hideClueOpts: Array,
    currentHideClueOpt: String
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/modal-shared.scss";
#xword-opts {
  .modal-body {
    text-align: left;
    .choice-opt {
      margin-left: 5%;
    }
  }
  .clue-panel-opts {
    max-height: 300px;
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
