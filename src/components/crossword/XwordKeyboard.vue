<template>
  <div class="keyboard-container">
    <div>Keyboard</div>
    <div class="key-row" v-for="keyRow in keyLayout" :key="keyRow.id">
      <div
        class="key"
        v-for="keyBtn in keyRow"
        :key="keyBtn.id"
        @click="keyBtn.actn(currentCell)"
      >
        <i :class="keyBtn.isFA ? keyBtn.disp : ''">
          {{ keyBtn.isFA ? "" : keyBtn.disp }}
        </i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentCell: Object
  },
  data() {
    return {
      keyLayout: []
    };
  },
  mounted() {
    this.keyLayout = this.createQwerty();
  },
  methods: {
    createQwerty(includeBackspace = true) {
      let retArr = [];
      let qwerty = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
      for (let row of qwerty) {
        let retRow = [];
        for (let ch of row) {
          retRow.push({
            disp: ch,
            actn: cell => {
              cell.entry = ch;
            }
          });
        }
        retArr.push(retRow);
      }
      if (includeBackspace) {
        retArr[2].push({
          disp: "fas fa-backspace",
          isFA: true,
          actn: cell => {
            cell.entry = "";
          }
        });
      }
      return retArr;
    }
  }
};
</script>

<style lang="scss" scoped>
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
.keyboard-container {
  border-radius: 0.35em;
  .key-row {
    display: flex;
    justify-content: center;
    .key {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      flex-direction: column;
      text-align: center;
      margin: 0.25em;
      border-radius: 0.35em;
      height: 30px;
      width: 30px;
      cursor: pointer;
    }
  }
}
</style>
