<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  youTubeId?: string;
  videoUrl?: string;
  imgUrl?: string;
  videoDesc?: string;
}>();

const trueVideoUrl = computed(() => {
  if (props.youTubeId) {
    return "https://youtu.be/" + props.youTubeId;
  }
  return props.videoUrl;
});

const trueImgUrl = computed(() => {
  if (props.youTubeId) {
    return "https://img.youtube.com/vi/" + props.youTubeId + "/mqdefault.jpg";
  }
  return props.imgUrl;
});
</script>

<template>
  <a target="_blank" :href="trueVideoUrl" class="climbing-video-item">
    <img :src="trueImgUrl" />
    <div class="video-desc">{{ videoDesc }}</div>
  </a>
</template>

<style lang="scss">
@import "@/assets/styles/wrapper.scss";

.climbing-video-item {
  margin: 5px;
  padding: 5px;
  border-radius: 10px;
  height: 240px;
  width: 348px;
  display: inline-block;
  text-decoration: none;
  font-weight: bold;

  img {
    display: inline 5px;
    margin: 5px;
    max-width: 320px;
    max-height: 170px;
  }
}
</style>
