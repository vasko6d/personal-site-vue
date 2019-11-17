<template>
  <div class="nested-viewer">
    <div class="blk-container">
      <h2>{{ title }}</h2>
      <div class="navigation">
        <a
          class="bg1-hvr bg1-txt-hvr"
          ref="ref-a"
          href="#"
          @click="isOpen = !isOpen"
        >
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
              <router-link
                class="bg1-hvr bg1-txt-hvr"
                :to="child.defaultPath || routePrefix + '/' + child.path"
                >{{ child.name }}</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "NestedViewer",
  props: {
    childrenPath: Array,
    title: String
  },
  data() {
    return {
      // dropdown data
      children: "",
      routePrefix: "",
      isOpen: false
    };
  },
  mounted() {
    let rs = this.$router.options.routes;
    for (const path of this.childrenPath) {
      if (path.startsWith("/")) {
        this.routePrefix += path;
      }
      rs = rs.find(r => {
        return r.path === path;
      }).children;
    }
    this.children = rs;
  },
  methods: {
    onClose() {
      this.isOpen = false;
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/styles/wrapper.scss";
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
          z-index: 2000;
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
