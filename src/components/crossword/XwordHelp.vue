<template>
  <div id="xword-help">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="header">
                <h2 id="help-top">
                  Help&nbsp;
                  <i class="fas fa-window-close" @click="$emit('close')"></i>
                </h2>
                <div id="quick-help-links">
                  <a class="help-ref" href="#touch-controls">Touch Controls</a
                  >&nbsp;|&nbsp;
                  <a class="help-ref" href="#keyboard-controls"
                    >Keyboard Controls</a
                  >&nbsp;|&nbsp;
                  <a class="help-ref" href="#tools">Tools</a>&nbsp;|&nbsp;
                  <a class="help-ref" href="#other">Other</a>&nbsp;|&nbsp;
                  <a class="help-ref" href="#on-page-keyboard"
                    >On&#8209;Page Keyboard</a
                  >&nbsp;|&nbsp;
                  <a class="help-ref" href="#clue-context">Clue Context</a
                  >&nbsp;|&nbsp;
                  <a class="help-ref" href="#current-clue-box">Current Clue</a
                  >&nbsp;|&nbsp;
                  <a class="help-ref" href="#multi-input"
                    >Multi&#8209;Input Cell</a
                  >
                </div>
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                <div id="touch-controls">
                  <h3>
                    Touch / Click Controls
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[Enter Cell]</strong> - Touch or click a cell to
                      enter that cell
                    </li>
                    <li>
                      <strong>[Switch Input Direction]</strong> - Touch or click
                      the same cell to switch input direction
                    </li>
                    <li>
                      <strong>[Switch Input Direction]</strong> - Touch or click
                      the
                      <a class="help-ref" href="#current-clue-box"
                        >Current Clue</a
                      >
                      to switch input direction
                    </li>
                    <li>
                      <strong>[Move Clue]</strong> - Touch or click left and
                      right arrows on either side of the
                      <a class="help-ref" href="#current-clue-box"
                        >Current Clue</a
                      >
                      to move to previous and next clues respectively
                    </li>
                    <li>
                      <strong>[Inputting Characters]</strong> - Use the
                      <a class="help-ref" href="#on-page-keyboard"
                        >On&#8209;Page Keyboard</a
                      >. Also see
                      <a class="help-ref" href="#clue-context">Clue Context</a>
                      and
                      <a class="help-ref" href="#multi-input"
                        >Multi&#8209;Input Cell</a
                      >
                    </li>
                  </ul>
                </div>

                <div id="keyboard-controls">
                  <h3>
                    Keyboard Controls
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[Arrow Keys]</strong> - Move throughout crossword
                    </li>
                    <li>
                      <strong>[Space Bar]</strong> - Switch input direction.
                    </li>
                    <li>
                      <strong>[Enter]</strong> - Move to next clue OR exit a
                      <a class="help-ref" href="#multi-input"
                        >Multi&#8209;Input Cell</a
                      >
                    </li>
                    <li><strong>[Tab]</strong> - Move to next Clue</li>
                    <li>
                      <strong>[Shift + Tab]</strong> - Move to previous Clue
                    </li>
                    <li>
                      <strong>
                        [Backspace
                        <i class="fas fa-backspace"></i>]
                      </strong>
                      - Delete charater from current cell if there is a
                      character to delete, otherwise move to the previous cell
                      and delete a character from that cell
                    </li>
                  </ul>
                </div>

                <div id="tools">
                  <h3>
                    Tools
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>
                        <i class="fas fa-pen-square"></i>
                      </strong>
                      - Make the current cell a
                      <a class="help-ref" href="#multi-input"
                        >Multi&#8209;Input Cell</a
                      >. This is required if you wish to input more than a
                      single character into a cell, or if you wish to input a
                      non-alphabet input.
                    </li>
                    <li>
                      <strong>
                        <i class="fas fa-flag"></i>
                      </strong>
                      - Flag the current cell. Puts a orange border around the
                      current cell. Purely aesthitic.
                    </li>
                    <li>
                      <strong>
                        <i class="fas fa-keyboard"></i>
                      </strong>
                      - If the setting "Enable toggle for the native keyboard"
                      is enabled, this icon will show up as a quick tool icon.
                      What it does is let you toggle whether or not the native
                      keyboard will come up on main crossword clicks. Clicking
                      this will do NOTHING if on a computer.
                    </li>
                  </ul>
                </div>

                <div id="other">
                  <h3>
                    Other
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[Mobile Keyboard]</strong> - If you are on mobile,
                      using a
                      <a class="help-ref" href="#multi-input"
                        >Multi&#8209;Input Cell</a
                      >
                      will bring up the default mobile keyboard. Inputting in
                      <a class="help-ref" href="#clue-context">Clue Context</a>
                      will also bring up the default mobile keyboard. You can
                      also try the setting "Enable toggle for the native
                      keyboard" which will give you more control of when the
                      native keyboard appears.
                    </li>
                    <li>
                      <strong>[Auto Solved Cells]</strong> - any cell solved
                      using the "Solve" tools will be green and is NOT editable
                      anymore.
                    </li>
                    <li>
                      <strong>[Theme]</strong> - a theme explanation can be
                      viewed when completed with puzzle IF the author provided
                      one. It will be found beneath the title.
                    </li>
                    <li>
                      <strong>[Note from Author]</strong> - a down caret will
                      appear next to the Crossword title if the author has
                      included a 'note'. Click the down caret to view.
                    </li>
                  </ul>
                </div>

                <div id="on-page-keyboard">
                  <h3>
                    On-Page Keyboard
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[What is it?]</strong> - A simple "QWERTY"
                      keyboard conviniently on screen to make cell input
                      simpler. You can disable it in Setting. Also see
                      <a class="help-ref" href="#other">Mobile Keyboard</a> if
                      on mobile.
                    </li>
                  </ul>
                </div>

                <div id="clue-context">
                  <h3>
                    Clue Context
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[What is it?]</strong> - The clue "context" is
                      simply the portion of the crossword that is relevant to
                      the particular clue. It is sync-ed to the full crossword
                      so any edits in the "context" will also update the main
                      crossword. It will be shown as Crossword Cells directly
                      beneath the particular clue. Its visibility can be
                      controlled in "Settings".
                    </li>
                    <li>
                      <strong>[Where is it?]</strong> - If enabled it will show
                      up directly beneath the clue in the "Clue Panel"
                    </li>
                    <li>
                      <strong>[What can it do?]</strong> - You can use it just
                      like you would the main crossword grid. It's a convinient
                      way to see just the important cells.
                    </li>
                    <li>
                      <strong>[Other notes]</strong> - If on mobile, a
                      <a class="help-ref" href="#other">Mobile Keyboard</a> will
                      come up when inputting in the clue context.
                    </li>
                  </ul>
                </div>

                <div id="current-clue-box">
                  <h3>
                    Current Clue Box
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[What is it?]</strong> - A convinient way to view
                      the current clue, easily navigate to the previous or next
                      clue, and easily switch input direction.
                    </li>
                    <li>
                      <strong>[Where is it?]</strong> - It is directly beaneath
                      the crossword grid.
                    </li>
                    <li>
                      <strong>[What can it do?]</strong> - See
                      <a class="help-ref" href="#touch-controls"
                        >Touch Controls</a
                      >. Touching the Current Clue will switch the input
                      direction. Touching the arrows on either side will move to
                      the previous or next clue.
                    </li>
                  </ul>
                </div>

                <div id="multi-input">
                  <h3>
                    Multi-Input Cell
                    <span style="font-size: 0.65em">
                      (
                      <a class="help-ref" href="#help-top">top</a> )
                    </span>
                    <hr />
                  </h3>
                  <ul>
                    <li>
                      <strong>[What is it?]</strong> - The only way to input
                      multiple characters into a cell, or non-alphabet
                      characters. On the main crossword this will show up as [
                      <i class="fas fa-comment-dots"></i> ], while in
                      <a class="help-ref" href="#clue-context">Clue Context</a>
                      it will only show what characters fit in side a cell,
                      truncating overflow.
                    </li>
                    <li>
                      <strong>[How do enable it?]</strong> - See
                      <a class="help-ref" href="#tools">Tools</a>.
                    </li>
                  </ul>
                </div>
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
export default {
  name: "XwordHelpModal"
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/modal-shared.scss";
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/light-theme.scss";
}
</style>
