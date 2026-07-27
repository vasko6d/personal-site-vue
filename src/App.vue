<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FooterLinks from '@/components/FooterLinks.vue'
import { useThemeStore, type Theme } from '@/stores/theme'

interface NavChild {
  name: string
  path: string
}
interface NavItem {
  path: string
  name: string
  children?: NavChild[]
  isOpen?: boolean
}

const router = useRouter()
const themeStore = useThemeStore()

const navList = ref<NavItem[]>([])

const isBlue = computed(() => themeStore.themeMatches('blue'))
const isDark = computed(() => themeStore.themeMatches('dark'))
const isLight = computed(() => themeStore.themeMatches('light'))
const isPink = computed(() => themeStore.themeMatches('pink'))

function setTheme(theme: Theme) {
  themeStore.setTheme(theme)
}

function onClose(closeItem = 'all') {
  for (const item of navList.value) {
    if (item.children && (closeItem === 'all' || item.name === closeItem)) {
      item.isOpen = false
    }
  }
}

// Per-nav-item toggle/dropdown elements, populated via function refs (see
// template) - a plain map keyed by item name, not Vue's $refs, since that
// approach previously proved fragile (see useClickOutside.ts's comment).
// One shared listener checks every currently-open item on each click,
// closing any whose toggle+dropdown elements don't contain the click target.
const toggleEls: Record<string, HTMLElement | null> = {}
const dropdownEls: Record<string, HTMLElement | null> = {}

function setToggleRef(name: string, el: Element | null) {
  toggleEls[name] = el as HTMLElement | null
}
function setDropdownRef(name: string, el: Element | null) {
  dropdownEls[name] = el as HTMLElement | null
}

function handleOutsideClick(e: Event) {
  const target = e.target as Node
  for (const item of navList.value) {
    if (!item.isOpen) continue
    const insideToggle = toggleEls[item.name]?.contains(target) ?? false
    const insideDropdown = dropdownEls[item.name]?.contains(target) ?? false
    if (!insideToggle && !insideDropdown) {
      item.isOpen = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('touchstart', handleOutsideClick)
  for (const route of router.options.routes) {
    if (route.meta?.isMainNav) {
      const navItem: NavItem = {
        path: route.meta?.defaultPath || route.path,
        name: String(route.name),
      }
      if (route.children?.length) {
        navItem.children = route.children.map((child) => ({
          name: String(child.name),
          path: child.meta?.defaultPath || child.path,
        }))
        navItem.isOpen = false
      }
      navList.value.push(navItem)
    }
  }
  const savedTheme = localStorage.theme as Theme | undefined
  if (savedTheme) {
    themeStore.setTheme(savedTheme)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('touchstart', handleOutsideClick)
})
</script>

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
            <li v-for="item in navList" :key="item.name">
              <template v-if="item.children">
                <a
                  class="bg1-hvr bg1-txt-hvr"
                  :ref="(el) => setToggleRef(item.name, el as Element | null)"
                  href="#"
                  :title="item.name"
                  @click="item.isOpen = !item.isOpen"
                >
                  {{ item.name }}
                  <i class="fa fa-angle-down"></i>
                </a>
                <div
                  :class="{ isOpen: item.isOpen }"
                  class="dropdown"
                  :ref="(el) => setDropdownRef(item.name, el as Element | null)"
                >
                  <ul>
                    <li v-for="{ path, name } in item.children" :key="name" @click="onClose()">
                      <router-link class="bg1-hvr bg1-txt-hvr" :to="path">{{ name }}</router-link>
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
      <FooterLinks />
    </div>
  </div>
</template>

<style lang="scss">
@use './assets/styles/wrapper';

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
    input[type='text'],
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
        // $nav-bg isn't in scope here (theme mixins are include-only, not module
        // variables) - under the old @import, this always statically resolved to
        // dark-theme's $nav-bg regardless of the active theme class, since it's
        // the only unscoped (non-.dark/.blue/.light/.pink-nested) theme import in
        // the chain. Hardcoded to match that existing compiled behavior exactly.
        background-color: rgba(#444, 0.5);
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
    background-position:
      0 0,
      5px 5px;
    background-size: 5px 5px;

    text-align: center;
    font: {
      family: 'Raleway', sans-serif;
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
</style>
