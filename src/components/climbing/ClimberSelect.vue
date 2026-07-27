<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { importedClimbers } from "@/data/importedClimbers";

defineProps<{
  baseURL: string;
  linkToJsonAnalysis?: boolean;
}>();

const router = useRouter();
const showClimbers = ref(false);

function navigate(fullPath: string) {
  router.push(fullPath);
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
        <li
          class="icn"
          @click="navigate(baseURL + climber.sandboxId)"
          v-for="climber in importedClimbers"
          :key="climber.sandboxId"
        >
          {{ climber.name }}
        </li>
        <li v-if="linkToJsonAnalysis">...</li>
        <li v-if="linkToJsonAnalysis" class="icn" @click="router.push('/climbing/import/analytics')">
          Import Json File
        </li>
      </ul>
    </div>
  </div>
</template>
