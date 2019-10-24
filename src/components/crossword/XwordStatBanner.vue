<template>
  <div id="x-stat">
    <div class="stat-body">
      <div v-if="!isCompleted">
        <div class="stat-head">
          Finishing Crossword
          <i
            class="fas fa-question-circle icn"
            @click="showHelp = !showHelp"
          ></i>
        </div>
        <div class="stat-help" v-if="showHelp">
          <ul style="list-style-type:none">
            <li class="help-itm">
              <strong>[ Submit ]</strong> - Sumbit your current puzzle. All
              wrong entries will be auto-solved and some basic statistics will
              be shown.
            </li>
            <li class="help-itm">
              <strong>[ Clear Wrong Answers ]</strong> - All wrong entries will
              be cleared.
            </li>
            <li class="help-itm">
              <strong>[ Show Errors ]</strong> - Turn on the setting "Show
              Errors" which will highlight all wrong answers in red. This will
              only turn on the setting for teh duration of this puzzle.
            </li>
          </ul>
        </div>
        <div class="btn-wrap">
          <div class="stat-btn" @click="$emit('solve', 'puzzle')">Submit</div>
        </div>
        <div class="btn-wrap">
          <div class="stat-btn" @click="$emit('clear', 'wrong')">
            Clear Wrong Answers
          </div>
        </div>
        <div class="btn-wrap">
          <div
            class="stat-btn"
            @click="
              $emit('setOption', {
                optionPath: ['errors', 'showErrors'],
                value: !showErrors,
                dontSave: true
              })
            "
          >
            <span v-if="showErrors">Hide</span>
            <span v-else>Show</span> Errors
          </div>
        </div>
      </div>
      <div v-else>
        <div class="stat-head">Statistics</div>
        <div class="stat-row">
          <div class="stat-type">Solve Time :</div>
          <div class="stat-val">{{ stats.time }} seconds</div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Score :</div>
          <div class="stat-val">
            {{ statWithPercent(stats.numTrulySolved, stats.inputCells) }}
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Total Cells :</div>
          <div class="stat-val">{{ stats.totalCells }}</div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Input Cells :</div>
          <div class="stat-val">
            {{ statWithPercent(stats.inputCells, stats.totalCells) }}
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Auto-Solved :</div>
          <div class="stat-val">
            {{ statWithPercent(stats.numAutoSolved, stats.inputCells) }}
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Shown Error :</div>
          <div class="stat-val">
            {{ statWithPercent(stats.numShownError, stats.inputCells) }}
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-type">Wrong Cleared :</div>
          <div class="stat-val">
            {{ statWithPercent(stats.numCleared, stats.inputCells) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isCompleted: Boolean,
    showErrors: Boolean,
    stats: Object
  },
  data() {
    return {
      showHelp: false
    };
  },
  methods: {
    statWithPercent(stat, total) {
      let perc = Math.round((stat / total) * 100);
      return stat + " (" + perc + "%)";
    }
  }
};
</script>

<style lang="scss" scoped>
#x-stat {
  .stat-head {
    font-weight: bold;
    font-size: 22px;
  }
  .stat-help {
    display: flex;
    justify-content: center;
  }
  .help-itm {
    margin-top: 0.4em;
    margin-bottom: 0.4em;
  }
  .stat-row {
    display: flex;
    justify-content: left;
    margin-left: 10%;
    .stat-type {
      flex-basis: 45%;
      text-align: right;
      margin-right: 1em;
      font-weight: bold;
    }
  }
  .btn-wrap {
    display: flex;
    justify-content: center;
    .stat-btn {
      flex-basis: 100px;
      flex-grow: 1;
      max-width: 250px;
      border-radius: 0.35em;
      cursor: pointer;
      padding: 5px 10px;
      margin: 3px;
      font-size: 14px;
    }
  }
}
</style>
