<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="blk-container">
    <h2>🚧 Coming soon</h2>
    <p>
      "{{ String(route.name) }}" hasn't been ported to the new site yet — check back once
      that phase of the migration lands.
    </p>
  </div>
</template>
