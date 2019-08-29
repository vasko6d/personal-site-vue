<template>
  <div
    id="app"
    @click="
      if (toggle) {
        toggle = false;
      } else {
        isOpen = false;
      }
    "
  >
    <div class="navigation">
      <ul>
        <li v-for="item in navList" :key="item.id">
          <template v-if="item.children">
            <a
              :href="item.url"
              :title="item.name"
              @click="(isOpen = !isOpen), (toggle = true)"
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
    </div>
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
      toggle: false,
      navList: [
        { url: "/", name: "Home" },
        { url: "/climbing", name: "Climbing" },
        {
          url: "#",
          name: "\xa0\xa0\xa0\xa0Portfolio\xa0\xa0\xa0\xa0",
          children: [
            {
              url: "/billiard-ball-robot",
              name: "Ball Robot"
            },
            {
              url: "/webgl-graphics",
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
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Raleway&display=swap");
@import "./assets/styles/variables.scss";

*,
::before,
::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#app {
  width: 100%;
  .navigation {
    margin-bottom: 1em;
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
      color: darken($nav-txt, 5%);
      border-radius: 0.35em;
      background-color: rgba($nav-bg, 0.5);
      transition: all 200ms ease;

      &:hover {
        color: $nav-txt;
        background-color: rgba($nav-bg, 0.8);
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

      li {
        width: 100%;
      }
      &.isOpen {
        transform: translatex(-50%);
        opacity: 1;
      }
    }
  }
}

body {
  margin-left: calc(100vw - 100%); /* fixes jumping scrollbar issue */
  position: relative;
  padding-top: 2em;
  padding-bottom: 2em;
  min-height: 100vh;
  background: radial-gradient($bg-clr-2 6%, transparent 6%), darken($bg-clr, 2%);
  background-position: 0 0, 5px 5px;
  background-size: 5px 5px;

  text-align: center;
  font: {
    family: "Raleway", sans-serif;
    size: 16px;
    weight: 500;
  }
  color: $nav-txt;
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
    margin-top: 1em;
    margin-bottom: 1em;
    max-width: 90%;
  }
}
</style>
