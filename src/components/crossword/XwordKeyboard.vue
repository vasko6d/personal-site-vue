<template>
  <div class="keyboard-container">
    <!--div>Keyboard</div-->
    <div class="key-row" v-for="keyRow in keyLayout" :key="keyRow.id">
      <div
        :class="['key', { 'key-a': keyBtn.isActive }]"
        v-for="keyBtn in keyRow"
        :key="keyBtn.id"
        @click="
          executePress(keyBtn.val);
          flashBtn(keyBtn);
        "
      >
        <i :class="keyBtn.isFA ? keyBtn.disp : ''">{{
          keyBtn.isFA ? "" : keyBtn.disp
        }}</i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyLayout: [],
      invKeyLayout: {}
    };
  },
  mounted() {
    [this.keyLayout, this.invKeyLayout] = this.createQwerty();
    window.addEventListener("keydown", e => {
      let ch = e.key.toUpperCase();
      //console.log("|" + ch + "|");
      if (ch.match(/^[A-Z]$/)) {
        this.executePress(ch);
        this.flashBtn(
          this.keyLayout[this.invKeyLayout[ch].r][this.invKeyLayout[ch].c]
        );
      } else {
        switch (ch) {
          case "ARROWLEFT":
          // Falls through
          case "ARROWRIGHT":
          // Falls through
          case "ARROWDOWN":
          // Falls through
          case "ARROWUP":
            e.preventDefault();
            this.executePress("$" + ch);
            break;
          case "ENTER":
          // Falls through
          case " ":
            e.preventDefault();
            this.executePress("$SWITCHDIRECTION");
            break;
          case "BACKSPACE":
            this.executePress("$" + ch);
            this.flashBtn(
              this.keyLayout[this.invKeyLayout[ch].r][this.invKeyLayout[ch].c]
            );
            break;
        }
      }
    });
  },
  methods: {
    executePress(ch) {
      this.$emit("executePress", ch);
    },
    flashBtn(btn) {
      btn.isActive = true;
      setTimeout(() => {
        btn.isActive = false;
      }, 200);
    },
    deleteKeyFxn() {},
    createQwerty(includeBackspace = true) {
      let retArr = [];
      let retInv = {};
      let qwerty = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
      for (let i = 0; i < qwerty.length; i++) {
        let row = qwerty[i];
        let retRow = [];
        for (let j = 0; j < row.length; j++) {
          let ch = row[j];
          retRow.push({
            disp: ch,
            val: ch,
            isActive: false
          });
          retInv[ch] = { r: i, c: j };
        }
        retArr.push(retRow);
      }
      if (includeBackspace) {
        retArr[2].push({
          disp: "fas fa-backspace",
          isFA: true,
          val: "$BACKSPACE",
          isActive: false
        });
      }
      return [retArr, retInv];
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
  user-select: none;
  border-radius: 0.35em;
  margin-bottom: 0.5em;
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
