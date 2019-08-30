<template>
  <div id="webgl-examples">
    <div class="blk-container">
      <h2>Graphics using WebGL</h2>
      <div class="navigation">
        <a ref="webgl-a" href="#/" @click="isOpen = !isOpen">
          <h3 ref="webgl-h3">
            {{ examples[exIdx].name }}
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
              v-for="(example, index) in examples"
              :key="example.index"
              @click="(exIdx = index), onClose()"
            >
              <router-link :to="example.url">{{ example.name }}</router-link>
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
      // webgl data
      exIdx: 0,
      examples: [
        { name: "Fractals on Canvas", url: "/webgl-graphics/fractals" },
        { name: "Cubes in Space", url: "/webgl-graphics/cubert" },
        { name: "FFVII Textures", url: "/webgl-graphics/fractals" },
        { name: "Creating the Galaxy", url: "/webgl-graphics/fractals" }
      ],
      // dropdown data
      isOpen: false
    };
  },
  methods: {
    onClose() {
      this.isOpen = false;
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/styles/variables.scss";
#webgl-examples {
  .blk-container {
    width: 100%;
    max-width: 650px;
    h2 {
      margin-bottom: 1em;
    }
    ul {
      list-style-type: none;
      text-align: left;
      margin-left: 0px;
      li {
        text-align: center;
        margin: 0.25em;
        color: darken($nav-txt, 15%);
        border-radius: 0.35em;
        background-color: rgba($nav-bg, 0.3);
        width: 100%;
        height: 100%;
        &:hover {
          color: $nav-txt;
          background-color: rgba($nav-bg, 0.6);
        }
      }
    }
    .navigation {
      position: relative;
      a {
        h3 {
          margin-top: 0px;
          margin-bottom: 0px;
        }
        color: darken($nav-txt, 15%);
        background-color: rgba($nav-bg, 0.3);
        &:hover {
          color: $nav-txt;
          background-color: rgba($nav-bg, 0.6);
        }
        display: inline-block;
      }
    }
  }
}
</style>
