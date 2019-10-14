<template>
  <div class="keyboard-container">
    <!--div>Keyboard</div-->
    <div class="key-row" v-for="keyRow in keyLayout" :key="keyRow.id">
      <div
        :class="[
          'key',
          { 'key-t': keyBtn.isActive === 1, 'key-a': keyBtn.isActive === 2 }
        ]"
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
      invKeyLayout: {},
      shift: false
    };
  },
  mounted() {
    [this.keyLayout, this.invKeyLayout] = this.createQwerty();
    window.addEventListener("keyup", e => {
      let ch = e.key.toUpperCase();
      if (ch === "SHIFT") {
        this.shift = false;
      }
    });
    window.addEventListener("keydown", e => {
      let ch = e.key.toUpperCase();
      //console.log("|" + ch + "|");
      if (ch.match(/^[^\s]$/)) {
        // Because of my 'psuedo-input" i need to disable most defautls
        // I manually exclude "Ctrl-Shift-J" which brings up browser console
        // but there is probably a more accepted way to do this.
        if (!(e.shiftKey && e.ctrlKey && ch === "J")) {
          e.preventDefault();
        }

        this.executePress(ch);
        if (ch.match(/^[A-Z]$/)) {
          this.flashBtn(
            this.keyLayout[this.invKeyLayout[ch].r][this.invKeyLayout[ch].c],
            2
          );
        }
      } else {
        e.preventDefault();
        switch (ch) {
          case "SHIFT":
            this.shift = true;
            break;
          case "ARROWLEFT":
          // Falls through
          case "ARROWRIGHT":
          // Falls through
          case "ARROWDOWN":
          // Falls through
          case "ARROWUP":
            this.executePress("$" + ch);
            break;
          case "TAB":
            if (this.shift) {
              this.executePress("$!" + ch);
            } else {
              this.executePress("$" + ch);
            }
            break;
          case "ENTER":
            this.executePress("$LEAVESPECIALINPUT");
            break;
          case "ESCAPE":
            this.executePress("$REMOVESPECIALINPUT");
            break;
          case " ":
            this.executePress("$SWITCHDIRECTION");
            break;
          case "BACKSPACE":
            this.executePress("$" + ch);
            this.flashBtn(
              this.keyLayout[this.invKeyLayout[ch].r][this.invKeyLayout[ch].c],
              2
            );
            break;
        }
      }
    });
  },
  methods: {
    executePress(ch, opts) {
      this.$emit("executePress", ch, opts);
    },
    flashBtn(btn, activeType = 1) {
      btn.isActive = activeType;
      setTimeout(() => {
        btn.isActive = 0;
      }, 200);
    },
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
            isActive: 0
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
          isActive: 0
        });
        retInv["BACKSPACE"] = { r: 2, c: retArr[2].length - 1 };
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
    height: 40px;
    .key {
      flex-grow: 1;
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      text-align: center;
      margin: 0.25em;
      padding-top: 3px;
      border-radius: 0.35em;
      height: 30px;
      width: 30px;
      cursor: pointer;
    }
  }
}
</style>
