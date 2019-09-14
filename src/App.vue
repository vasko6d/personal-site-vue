<template>
  <div
    id="app"
    :class="{
      blue: isBlue,
      dark: isDark,
      light: isLight
    }"
  >
    <div class="wrapper">
      <div class="navigation">
        <ul>
          <li v-for="item in navList" :key="item.id">
            <template v-if="item.children">
              <a
                :ref="item.name"
                :href="item.url"
                :title="item.name"
                @click="isOpen = !isOpen"
              >
                {{ item.name }}
                <i ref="drop-i" class="fa fa-angle-down"></i>
              </a>
              <div
                :class="{ isOpen }"
                class="dropdown"
                v-closable="{
                  excludeList: [item.name, 'drop-i'],
                  handler: 'onClose'
                }"
              >
                <ul>
                  <li
                    v-for="{ url, name, index } in item.children"
                    :key="index"
                    @click="onClose()"
                  >
                    <router-link :to="url">{{ name }}</router-link>
                  </li>
                </ul>
              </div>
            </template>
            <template v-else>
              <router-link :to="item.url">{{ item.name }}</router-link>
            </template>
          </li>
        </ul>
      </div>
      <div>
        <span class="set-theme" @click="setTheme('light')">light</span>&nbsp;|
        <span class="set-theme" @click="setTheme('dark')">dark</span>&nbsp;|
        <span class="set-theme" @click="setTheme('blue')">blue</span>
      </div>
      <router-view />
      <footer-links />
    </div>
  </div>
</template>
<script>
import FooterLinks from "@/components/FooterLinks.vue";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";

export default {
  name: "app",
  components: {
    FooterLinks
  },
  props: ["item"],
  data() {
    return {
      isOpen: false,
      toggle: false,
      navList: [
        { url: "/", name: "Home" },
        { url: "/climbing", name: "Climbing" },
        {
          url: "#/",
          name: "\xa0\xa0\xa0\xa0Portfolio\xa0\xa0\xa0\xa0",
          children: [
            {
              url: "/billiard-ball-robot",
              name: "Ball Robot"
            },
            {
              url: "/webgl-graphics/fractals",
              name: "Graphics"
            },
            {
              url: "/island-game",
              name: "Island Game"
            },
            {
              url: "/finite-volume",
              name: "Finite Volume"
            },
            {
              url: "/finite-element",
              name: "Finite Element"
            },
            {
              url: "/crosswords",
              name: "Crosswords"
            }
          ]
        }
      ]
    };
  },
  computed: {
    ...mapGetters(["themeMatches"]),
    isBlue() {
      return this.themeMatches("blue");
    },
    isDark() {
      return this.themeMatches("dark");
    },
    isLight() {
      return this.themeMatches("light");
    }
  },
  methods: {
    onClose() {
      this.isOpen = false;
    },
    ...mapActions(["setTheme"])
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Raleway&display=swap");
@import "./assets/styles/dark-theme.scss";

*,
::before,
::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
.blue {
  @import "./assets/styles/blue-theme.scss";
}
.dark {
  @import "./assets/styles/dark-theme.scss";
}
.light {
  @import "./assets/styles/dark-theme.scss";
}

#app {
  .wrapper {
    width: 100%;
    .navigation {
      user-select: none;
      ul {
        list-style-type: none;
        li {
          position: relative;
          margin: 0.25em;
          text-align: center;
          display: inline-block;
        }
      }
      a {
        display: block;
        padding: 0.55em 1em;
        text-decoration: none;
        width: 100%;
        height: 100%;
        border-radius: 0.35em;
        transition: all 200ms ease;
      }
      .dropdown {
        z-index: 3;
        position: absolute;
        left: 50%;
        width: 100%;
        transform: translatex(-50%) rotatex(90deg) scale(0);
        margin-top: 0.55em;
        transform-origin: 0 0;
        border-radius: 0.35em;
        background-color: rgba($nav-bg, 0.5);
        transition: all 200ms linear;

        li {
          width: 100%;
          padding-right: 9px;
        }
        &.isOpen {
          transform: translatex(-50%);
          opacity: 1;
        }
      }
    }
    padding-left: calc(100vw - 100%); /* fixes jumping scrollbar issue */
    position: relative;
    padding-top: 2em;
    padding-bottom: 2em;
    min-height: 100vh;
    background-position: 0 0, 5px 5px;
    background-size: 5px 5px;

    text-align: center;
    font: {
      family: "Raleway", sans-serif;
      size: 16px;
      weight: 500;
    }
    line-height: 1.5;

    .blk-container {
      display: inline-block;
      max-width: 850px;
      ul {
        list-style-type: circle;
        margin-left: 5%;
        text-align: left;
        li {
          text-align: left;
        }
      }
    }
    h3 {
      margin-bottom: 1em;
      margin-top: 1em;
    }
    p {
      text-align: left;
      margin-left: 4%;
    }
    img {
      margin-top: 0.5em;
      margin-bottom: 1em;
      max-width: 90%;
    }
    .set-theme {
      cursor: pointer;
    }
  }
}
</style>
