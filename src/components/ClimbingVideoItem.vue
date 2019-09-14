<template>
  <a target="_blank" :href="trueVideoUrl" class="climbing-video-item">
    <img :src="trueImgUrl" />
    <div class="video-desc">{{ videoDesc }}</div>
  </a>
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
        s = "https://img.youtube.com/vi/" + this.youTubeId + "/mqdefault.jpg";
      }
      return s;
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
  @import "@/assets/styles/dark-theme.scss";
}

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
    max-height: 180px;
  }
}
</style>
