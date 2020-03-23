<template>
  <div id="x-head" class="bg1">
    <xword-help v-if="showHelp" @close="modalToggle(false, 'showHelp')" />
    <xword-settings
      v-if="showSettings"
      @close="modalToggle(false, 'showSettings')"
      @setOption="setOption"
      @setNativeKeyboardOption="setNativeKeyboardOption"
      @defaultSettings="$emit('defaultSettings')"
      :opts="opts"
    />
    <xword-tools
      v-if="showTools"
      @close="modalToggle(false, 'showTools')"
      @clear="clear"
      @solve="solve"
      @saveProgress="
        $emit('saveProgress');
        modalToggle(false, 'showTools');
      "
    />
    <div class="info-nav">
      <div class="right-close">
        <i
          class="fas fa-times icn"
          @click="$router.push('/crossword/search')"
        ></i>
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
          <span
            v-show="showTheme"
            @click="showTheme = !showTheme"
            style="cursor: pointer;"
            >{{ themeExp }}</span
          >
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
            :class="[
              'icn',
              'fas',
              'fa-keyboard',
              { enab: nativeKeyboardEnabled },
            ]"
            @click="$emit('toggleNativeKeyboard')"
          ></i
          >|
        </span>
        <i class="icn fas fa-pen-square" @click="$emit('specialEdit')"></i>|
        <i
          class="icn fas fa-flag"
          @click="$emit('flagCell', { flag: 'orange' })"
        ></i
        >|
        <i class="icn fas fa-tools" @click="modalToggle(true, 'showTools')"></i>
        |
        <i
          class="icn fas fa-cogs"
          @click="modalToggle(true, 'showSettings')"
        ></i>
        |
        <i
          class="icn fas fa-question-circle"
          @click="modalToggle(true, 'showHelp')"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
import Timer from "@/mixins/webgl/Timer.js";
import XwordHelp from "@/components/crossword/XwordHelp.vue";
import XwordSettings from "@/components/crossword/XwordSettings.vue";
import XwordTools from "@/components/crossword/XwordTools.vue";
export default {
  props: {
    title: String,
    author: String,
    note: String,
    themeExp: String,
    completed: Boolean,
    nativeKeyboardEnabled: Boolean,
    publishDate: Date,
    opts: Object,
    timer: Timer,
  },
  components: {
    XwordHelp,
    XwordSettings,
    XwordTools,
  },
  data() {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      interval: "",
      showNote: false,
      showTheme: false,
      // Help Modals
      showHelp: false,
      showSettings: false,
      showTools: false,
    };
  },
  computed: {
    formattedTime() {
      let hh = (this.hours < 10 ? "0" : "") + this.hours.toString();
      let mm = (this.minutes < 10 ? "0" : "") + this.minutes.toString();
      let ss = (this.seconds < 10 ? "0" : "") + this.seconds.toString();
      return hh + ":" + mm + ":" + ss;
    },
  },
  mounted() {
    this.interval = setInterval(() => {
      this.calcTime();
    }, 1000);
  },
  methods: {
    setOption(payload) {
      this.$emit("setOption", payload);
    },
    setNativeKeyboardOption(payload) {
      this.$emit("setOption", payload);
      this.$emit("disableNativeKeyboard");
    },
    clear(payload) {
      this.modalToggle(false, "showTools");
      this.$emit("clear", payload);
    },
    solve(payload) {
      this.modalToggle(false, "showTools");
      this.$emit("solve", payload);
    },
    calcTime() {
      // Time calculations for days, hours, minutes and seconds
      let sec = this.timer.getTimeSec(true);
      this.hours = Math.floor((sec / (60 * 24)) % 100);
      this.minutes = Math.floor(sec / 60) % 60;
      this.seconds = sec % 60;
    },
    modalToggle(b, propName) {
      this[propName] = b;
      if (b) {
        document.documentElement.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "auto";
      }
    },
  },
};
</script>

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
    font-family: "Lucida Console", Monaco, monospace;
  }
}
</style>
