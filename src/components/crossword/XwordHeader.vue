<template>
  <div id="x-head">
    <xword-help v-if="showHelp" @close="modalToggle(false, 'showHelp')" />
    <xword-Settings
      v-if="showSettings"
      @close="modalToggle(false, 'showSettings')"
    />
    <div class="info-nav">
      <div class="info">
        <h2>{{ title }}</h2>
        by {{ author }}, {{ publishDate.toDateString() }}
      </div>
    </div>
    <div class="tool-bar">
      <div class="left">
        <div class="left-timer">{{ formattedTime }}</div>
      </div>
      <div class="middle"></div>
      <div class="right">
        <i class="fas fa-pen-square" @click="$emit('specialEdit')"></i>|
        <i
          class="fas fa-flag"
          @click="$emit('flagCell', { flag: 'orange' })"
        ></i
        >|
        <i class="fas fa-cog" @click="modalToggle(true, 'showSettings')"></i>
        |
        <i
          class="fas fa-question-circle"
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
export default {
  props: {
    title: String,
    author: String,
    publishDate: Date,
    timer: Timer
  },
  components: {
    XwordHelp,
    XwordSettings
  },
  data() {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      interval: "",
      // Help Modals
      showHelp: false,
      showSettings: false
    };
  },
  computed: {
    formattedTime() {
      let hh = (this.hours < 10 ? "0" : "") + this.hours.toString();
      let mm = (this.minutes < 10 ? "0" : "") + this.minutes.toString();
      let ss = (this.seconds < 10 ? "0" : "") + this.seconds.toString();
      return hh + ":" + mm + ":" + ss;
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.calcTime();
    }, 1000);
  },
  methods: {
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
    }
  }
};
</script>

<style lang="scss" scoped>
#x-head {
  .info-nav {
    display: flex;
    justify-content: space-between;
    .info {
      flex-grow: 1;
    }
  }
  .tool-bar {
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
    padding-right: 10px;
    .middle {
      flex-grow: 1;
    }
    i {
      margin-left: 4px;
      margin-right: 4px;
    }
  }
  .left-timer {
    font-family: "Lucida Console", Monaco, monospace;
  }
}
</style>