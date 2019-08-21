<template>
  <div id="app">
    <ul id="navigation">
      <li v-for="item in navList" :key="item.id">
        <template v-if="item.children">
          <a
            :href="item.url"
            :title="item.name"
            @click="(isOpen = !isOpen), (active = !active)"
            :class="{ active }"
          >
            {{ item.name }}
            <i class="fa fa-angle-down"></i>
          </a>
          <div :class="{ isOpen }" class="dropdown">
            <ul>
              <li v-for="{ url, name, index } in item.children" :key="index">
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
    <router-view />
    <footer-links />
  </div>
</template>
<script>
import FooterLinks from "@/components/FooterLinks.vue";

export default {
  name: "app",
  components: {
    FooterLinks
  },
  props: ["item"],
  data() {
    return {
      isOpen: false,
      active: false,
      navList: [
        { url: "/", name: "Home" },
        {
          url: "#",
          name: "Portfolio",
          children: [
            {
              url: "/billiard-ball-robot",
              name: "Ball Robot"
            },
            {
              url: "/island-game",
              name: "Island Game"
            },
            {
              url: "/graphics",
              name: "Graphics"
            },
            {
              url: "/finite-volume",
              name: "Finite Volume"
            },
            {
              url: "/finite-element",
              name: "Finite Element"
            }
          ]
        },
        { url: "/climbing", name: "Climbing" },
        { url: "/crosswords", name: "Crosswords" }
      ]
    };
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Raleway&display=swap");

$nav-bg: #444;
$nav-txt: #9dad7f;

$bg-clr: #000000;
$bg-clr-2: #2d3029;

*,
::before,
::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@mixin flex($fd: row, $jc: center, $ai: center) {
  display: flex;
  flex-direction: $fd;
  justify-content: $jc;
  align-items: $ai;
}

body {
  margin-left: calc(100vw - 100%); /* fixes jumping scrollbar issue */
  position: relative;
  padding-top: 2em;
  padding-bottom: 2em;
  min-height: 100vh;
  text-align: center;
  font: {
    family: "Raleway", sans-serif;
    size: 16px;
    weight: 500;
  }
  line-height: 1.5;
  @include flex($ai: flex-start);
  color: currentcolor;
  background: radial-gradient($bg-clr-2 6%, transparent 6%), darken($bg-clr, 2%);
  background-position: 0 0, 5px 5px;
  background-size: 5px 5px;
}

ul {
  list-style-type: none;

  li {
    position: relative;
    margin: 0.25em;
    text-align: center;

    a {
      display: block;
      padding: 0.55em 1em;
      text-decoration: none;
      color: darken($nav-txt, 15%);
      border-radius: 0.35em;
      background-color: rgba($nav-bg, 0.5);
      transition: all 200ms ease;

      &:hover {
        color: $nav-txt;
        background-color: rgba($nav-bg, 0.8);
      }
      &.active {
        color: $nav-txt;
        background-color: rgba($nav-bg, 0.8);
      }
    }

    ul {
      li {
        a {
          background-color: rgba($nav-bg, 0.5);
        }
      }
    }
  }

  &#navigation {
    margin-bottom: 0.8em;
    @include flex($ai: flex-start);
  }
}

.dropdown {
  position: absolute;
  left: 50%;
  width: 100%;
  transform: translatex(-50%) rotatex(90deg) scale(0);
  margin-top: 0.55em;
  transform-origin: 0 0;
  border-radius: 0.35em;
  background-color: rgba($nav-bg, 0.5);
  transition: all 200ms linear;

  &.isOpen {
    transform: translatex(-50%);
    opacity: 1;
  }
}
</style>
