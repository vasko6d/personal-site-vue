<template>
  <div id="webgl-examples">
    <div class="blk-container">
      <h2>Graphics using WebGL</h2>
      <div class="navigation">
        <a ref="webgl-a" href="#/" @click="isOpen = !isOpen">
          <h3 ref="webgl-h3">
            {{ $router.currentRoute.name }}
            <i ref="webgl-i" class="fa fa-angle-down"></i>
          </h3>
        </a>
        <div
          :class="{ isOpen }"
          class="dropdown"
          v-closable="{
            excludeList: ['webgl-a', 'webgl-h3', 'webgl-i'],
            handler: 'onClose'
          }"
        >
          <ul>
            <li
              v-for="child in webglChildren"
              :key="child.index"
              @click="onClose()"
            >
              <router-link :to="correctedUrl(child.path)">
                {{ child.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "WebGLExamples",
  data() {
    return {
      // dropdown data
      webglChildren: "",
      isOpen: false
    };
  },
  mounted() {
    this.webglChildren = this.$router.options.routes.find(r => {
      return r.path === "/webgl-graphics";
    }).children;
  },
  methods: {
    onClose() {
      this.isOpen = false;
    },
    correctedUrl(url) {
      if (this.$router.currentRoute.path === "/webgl-graphics") {
        return "webgl-graphics/" + url;
      }
      return url;
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/dark-theme.scss";
}
.wrapper {
  #webgl-examples {
    .blk-container {
      width: 100%;
      max-width: 650px;
      h2 {
        margin-bottom: 0.5em;
      }
      ul {
        margin-left: 0px;
      }
      .navigation {
        position: relative;
        margin-bottom: 1em;
        z-index: 2;
        a {
          h3 {
            margin-top: 0px;
            margin-bottom: 0px;
          }
          display: inline-block;
        }
      }
    }
  }
}
</style>
