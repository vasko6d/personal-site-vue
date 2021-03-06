<template>
  <div
    id="app"
    :class="{
      blue: isBlue,
      dark: isDark,
      light: isLight,
      pink: isPink,
    }"
  >
    <div class="wrapper">
      <div class="main-nav-wrapper">
        <div class="navigation">
          <ul>
            <li v-for="item in navList" :key="item.id">
              <template v-if="item.children">
                <a
                  class="bg1-hvr bg1-txt-hvr"
                  :ref="item.name"
                  href="#"
                  :title="item.name"
                  @click="item.isOpen = !item.isOpen"
                >
                  {{ item.name }}
                  <i :ref="item.name + '-i'" class="fa fa-angle-down"></i>
                </a>
                <div
                  :class="{ isOpen: item.isOpen }"
                  class="dropdown"
                  v-closable="{
                    excludeList: [item.name, item.name + '-i'],
                    handler: 'onClose',
                    uniqueFxnId: item.name,
                  }"
                >
                  <ul>
                    <li
                      v-for="{ path, name } in item.children"
                      :key="name"
                      @click="onClose()"
                    >
                      <router-link class="bg1-hvr bg1-txt-hvr" :to="path">{{
                        name
                      }}</router-link>
                    </li>
                  </ul>
                </div>
              </template>
              <template v-else>
                <router-link class="bg1-hvr bg1-txt-hvr" :to="item.path">
                  {{ item.name }}
                </router-link>
              </template>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <span class="icn" @click="setTheme('light')">light</span>&nbsp;|
        <span class="icn" @click="setTheme('dark')">dark</span>&nbsp;|
        <span class="icn" @click="setTheme('blue')">blue</span>&nbsp;|
        <span class="icn" @click="setTheme('pink')">pink</span>
      </div>
      <router-view :key="$route.path" />
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
    FooterLinks,
  },
  props: ["item"],
  data() {
    return {
      navList: [],
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
    },
    isPink() {
      return this.themeMatches("pink");
    },
  },
  mounted() {
    for (const route of this.$router.options.routes) {
      if (route.isMainNav) {
        let mainNavItem = {
          path: route.defaultPath || route.path,
          name: route.name,
        };
        if (route.children) {
          mainNavItem["children"] = [];
          mainNavItem["isOpen"] = false;
          for (const child of route.children) {
            mainNavItem["children"].push({
              name: child.name,
              path: child.defaultPath || child.path,
            });
          }
        }
        this.navList.push(mainNavItem);
      }
    }
    if (localStorage.theme) {
      this.setTheme(localStorage.theme);
    }
  },
  methods: {
    onClose(closeItem = "all") {
      for (let item of this.navList) {
        if (item.children && (closeItem === "all" || item.name === closeItem)) {
          item.isOpen = false;
        }
      }
    },
    ...mapActions(["setTheme"]),
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Raleway&display=swap");
@import "./assets/styles/wrapper.scss";

*,
::before,
::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#app {
  .wrapper {
    width: 100%;
    .main-nav-wrapper {
      display: inline-block;
      max-width: 750px;
      @media only screen and (max-width: 850px) {
        font-size: 15.5px;
      }
      @media only screen and (max-width: 700px) {
        font-size: 15px;
      }
    }
    input[type="text"],
    select {
      padding: 5px;
      margin: 8px 5px;
      display: inline-block;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    label {
      font-weight: bold;
    }

    .navigation {
      width: 100%;
      ul {
        display: flex;
        justify-content: space-between;
        user-select: none;
        list-style-type: none;
        li {
          position: relative;
          margin: 0.25em;
          text-align: center;
          flex-grow: 1;
          flex-shrink: 1;
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
        z-index: 5000;
        position: absolute;
        left: 50%;
        width: 100%;
        transform: translatex(-50%) rotatex(90deg) scale(0);
        margin-top: 0.55em;
        transform-origin: 0 0;
        border-radius: 0.35em;
        background-color: rgba($nav-bg, 0.5);
        transition: all 200ms linear;

        ul {
          display: inline;
          li {
            display: inline-block;
            width: 100%;
            padding-right: 9px;
          }
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

    input,
    select {
      font-size: 16px;
    }

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
    .ind-p {
      text-align: left;
      margin-left: 4%;
    }
    img {
      margin-top: 0.5em;
      margin-bottom: 1em;
      max-width: 90%;
    }
  }
}

.tooltip {
  display: block !important;
  z-index: 4000;
  font-family: "Lucida Console", Monaco, monospace;
}

.tooltip .tooltip-inner {
  background: rgba(black, 0.7);
  border: 2px solid black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 5px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 0px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -4px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 0px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -4px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[aria-hidden="true"] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s, visibility 0.15s;
}

.tooltip[aria-hidden="false"] {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s;
}
</style>
