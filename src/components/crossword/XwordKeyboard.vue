<template>
  <div class="keyboard-container bg1">
    <!--div>Keyboard</div-->
    <div class="key-row" ref="row" v-for="keyRow in keyLayout" :key="keyRow.id">
      <div
        ref="key"
        :class="[
          'key',
          {
            'key-t': keyBtn.isActive === 1,
            'key-a': keyBtn.isActive === 2,
            'key-wide': keyBtn.val === '$BACKSPACE'
          }
        ]"
        v-for="keyBtn in keyRow"
        :key="keyBtn.id"
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
    window.addEventListener("keydown", this.keydownFxn);
    this.$nextTick(() => {
      let rows = document.getElementsByClassName("key-row");
      for (let r = 0; r < rows.length; r++) {
        let row = rows[r];
        let keys = row.getElementsByClassName("key");
        for (let keynum = 0; keynum < keys.length; keynum++) {
          let keyel = keys[keynum];
          let keybtn = this.keyLayout[r][keynum];
          keyel.addEventListener("mousedown", this.startHandler(keybtn));
          keyel.addEventListener("touchstart", this.startHandler(keybtn));
          keyel.addEventListener("mouseup", this.endHandler(keybtn));
          keyel.addEventListener("touchend", this.endHandler(keybtn));
          keyel.addEventListener("mouseleave", this.abortHandler(keybtn));
          keyel.addEventListener("touchmove", this.abortHandler(keybtn));
          keyel.addEventListener("touchcancel", this.abortHandler(keybtn));
        }
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.keydownFxn);
  },
  methods: {
    startHandler(key) {
      return e => {
        e.preventDefault();
        key.isActive = 1;
      };
    },
    abortHandler(key) {
      return e => {
        e.preventDefault();
        key.isActive = 0;
      };
    },
    endHandler(key) {
      return e => {
        if (key.isActive === 1) {
          e.preventDefault();
          this.flashBtn(key);
          this.executePress(key.val);
        }
      };
    },
    keydownFxn(e) {
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
            if (e.shiftKey) {
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
    },
    executePress(ch, opts) {
      this.$emit("executePress", ch, opts);
    },
    flashBtn(btn, activeType = 1) {
      if (activeType === 2) {
        btn.isActive = activeType;
        setTimeout(() => {
          btn.isActive = 0;
        }, 200);
      } else {
        btn.isActive = 0;
      }
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
.pink {
  @import "@/assets/styles/pink-theme.scss";
}
.keyboard-container {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: none;
  margin-bottom: 0.5em;
  .key-row {
    display: flex;
    justify-content: center;
    height: 45px;
    margin-left: 3px;
    margin-right: 3px;
    .key {
      flex-grow: 1;
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      flex-basis: 30px;
      text-align: center;
      margin: 3px;
      padding-top: 5px;
      border-radius: 0.35em;
      height: 40px;
      cursor: pointer;
    }
    .key-wide {
      flex-basis: 60px;
    }
    .key-t {
      z-index: 9000;
      height: 70px;
      box-shadow: 0px 0px 1px 0px #000000; /* Standard */
      margin-top: -27px;
    }
  }
}
</style>
