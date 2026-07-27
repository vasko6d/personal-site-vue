<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import { useClickOutside } from '@/composables/useClickOutside'

const props = defineProps<{
  childrenPath: string[]
  routePrefix: string
  title: string
}>()

const route = useRoute()
const router = useRouter()

const children = ref<readonly RouteRecordRaw[]>([])
const isOpen = ref(false)
const toggleRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

useClickOutside([toggleRef, dropdownRef], () => {
  isOpen.value = false
})

onMounted(() => {
  let rs: readonly RouteRecordRaw[] | undefined = router.options.routes
  for (const path of props.childrenPath) {
    rs = rs?.find((r) => r.path === path)?.children
  }
  children.value = rs ?? []
})

function onClose() {
  isOpen.value = false
}
</script>

<template>
  <div class="nested-viewer">
    <div class="blk-container">
      <h2>{{ title }}</h2>
      <div class="navigation">
        <a class="bg1-hvr bg1-txt-hvr" ref="toggleRef" href="#" @click="isOpen = !isOpen">
          <h3>
            {{ route.name }}
            <i class="fa fa-angle-down"></i>
          </h3>
        </a>
        <div :class="{ isOpen }" class="dropdown" ref="dropdownRef">
          <ul>
            <li v-for="child in children" :key="child.path" @click="onClose()">
              <router-link
                class="bg1-hvr bg1-txt-hvr"
                :to="child.meta?.defaultPath || routePrefix + '/' + child.path"
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

<style lang="scss">
@use '@/assets/styles/wrapper';
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
