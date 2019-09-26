<template>
  <div class="nested-viewer">
    <div class="blk-container">
      <h2>{{ title }}</h2>
      <div class="navigation">
        <a ref="ref-a" href="#/" @click="isOpen = !isOpen">
          <h3 ref="ref-h3">
            {{ $router.currentRoute.name }}
            <i ref="ref-i" class="fa fa-angle-down"></i>
          </h3>
        </a>
        <div
          :class="{ isOpen }"
          class="dropdown"
          v-closable="{
            excludeList: ['ref-a', 'ref-h3', 'ref-i'],
            handler: 'onClose',
            uniqueFxnId: $router.currentRoute.path
          }"
        >
          <ul>
            <li v-for="child in children" :key="child.index" @click="onClose()">
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
  name: "NestedViewer",
  props: {
    path: String,
    title: String
  },
  data() {
    return {
      // dropdown data
      children: "",
      isOpen: false
    };
  },
  mounted() {
    this.children = this.$router.options.routes.find(r => {
      return r.path === "/" + this.path;
    }).children;
  },
  methods: {
    onClose() {
      this.isOpen = false;
    },
    correctedUrl(url) {
      if (this.$router.currentRoute.path === "/" + this.path) {
        return this.path + "/" + url;
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
  @import "@/assets/styles/light-theme.scss";
}
#app {
  .wrapper {
    .nested-viewer {
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
            text-align: center;
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
}
</style>
