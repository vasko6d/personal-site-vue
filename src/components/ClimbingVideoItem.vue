<template>
  <div class="climbing-video-item">
    <a target="_blank" :href="trueVideoUrl">
      <img :src="trueImgUrl" />
    </a>
    <div class="video-desc">{{ videoDesc }}</div>
  </div>
</template>

<script>
export default {
  name: "ClimbingVideoItem",
  props: {
    youTubeId: String,
    videoUrl: String,
    imgUrl: String,
    videoDesc: String
  },
  computed: {
    trueVideoUrl: function() {
      var s = this.videoUrl;
      if (this.youTubeId) {
        s = "https://youtu.be/" + this.youTubeId;
      }
      return s;
    },
    trueImgUrl: function() {
      var s = this.imgUrl;
      if (this.youTubeId) {
        s = "https://img.youtube.com/vi/" + this.youTubeId + "/hqdefault.jpg";
      }
      return s;
    }
  }
};
</script>

<style lang="scss" scoped></style>
