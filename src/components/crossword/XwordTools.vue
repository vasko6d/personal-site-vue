<template>
  <div id="xword-tools">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="header">
                <h2>
                  Tools&nbsp;
                  <i
                    class="fas fa-window-close icn"
                    @click="$emit('close')"
                  ></i>
                </h2>
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                <h4><i class="fas fa-caret-right"></i>&nbsp;Save</h4>
                <div class="note">Automatically Saves periodically</div>
                <div>
                  <div class="tool-btn safe" @click="$emit('saveProgress')">
                    <i class="fas fa-save"></i>&nbsp;Save Progress
                  </div>
                </div>
                <h4><i class="fas fa-caret-right"></i>&nbsp;Clear</h4>
                <div>
                  <div class="tool-btn danger" @click="$emit('clear', 'flags')">
                    <i class="far fa-trash-alt"></i>&nbsp;Clear all flags
                  </div>
                </div>
                <div>
                  <div class="tool-btn danger" @click="$emit('clear', 'wrong')">
                    <i class="far fa-trash-alt"></i>&nbsp;Clear wrong entries
                  </div>
                </div>
                <div>
                  <div class="tool-btn danger" @click="$emit('clear', 'clue')">
                    <i class="far fa-trash-alt"></i>&nbsp;Clear current clue
                  </div>
                </div>
                <div>
                  <div
                    class="tool-btn danger"
                    @click="$emit('clear', 'puzzle')"
                  >
                    <i class="far fa-trash-alt"></i>&nbsp;Clear entire puzzle
                  </div>
                </div>
                <h4><i class="fas fa-caret-right"></i>&nbsp;Solve</h4>
                <div>
                  <div class="tool-btn safe" @click="$emit('solve', 'cell')">
                    <i class="far fa-check-square"></i>&nbsp;Solve cell
                  </div>
                </div>
                <div>
                  <div class="tool-btn safe" @click="$emit('solve', 'clue')">
                    <i class="far fa-check-square"></i>&nbsp;Solve clue
                  </div>
                </div>
                <div>
                  <div class="tool-btn safe" @click="$emit('solve', 'puzzle')">
                    <i class="far fa-check-square"></i>&nbsp;Complete puzzle
                  </div>
                </div>
              </slot>
            </div>
            <div class="modal-footer">
              <slot name="footer">
                <h2>
                  <i
                    class="fas fa-check-square icn"
                    @click="$emit('close')"
                  ></i>
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
export default {
  name: "XwordToolModal"
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/modal-shared.scss";
#xword-tools {
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
}
</style>
