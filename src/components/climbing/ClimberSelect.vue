<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClimberManifestStore } from '@/stores/useClimberManifestStore'

defineProps<{
  baseURL: string
  linkToJsonAnalysis?: boolean
}>()

const router = useRouter()
const showClimbers = ref(false)
const manifestStore = useClimberManifestStore()
manifestStore.fetchAll()

function navigate(fullPath: string) {
  router.push(fullPath)
}
</script>

<template>
  <div>
    <div>
      <div class="b">
        <span class="icn" @click="showClimbers = !showClimbers">
          Climber Select
          <i
            :class="{
              fas: true,
              'fa-angle-down': !showClimbers,
              'fa-angle-up': showClimbers,
            }"
          ></i>
        </span>
      </div>
    </div>
    <div v-show="showClimbers" class="flex-row">
      <ul style="list-style-type: none">
        <li v-if="manifestStore.loading" class="icn">Loading Climbers...</li>
        <li v-else-if="manifestStore.error" class="icn">{{ manifestStore.error }}</li>
        <li
          v-else
          class="icn"
          @click="navigate(baseURL + climber.userSlug)"
          v-for="climber in manifestStore.sortedClimbers"
          :key="climber.userSlug"
        >
          {{ climber.userName }}
        </li>
        <li v-if="linkToJsonAnalysis">...</li>
        <li
          v-if="linkToJsonAnalysis"
          class="icn"
          @click="router.push('/climbing/import/analytics')"
        >
          Import Json File
        </li>
      </ul>
    </div>
  </div>
</template>
