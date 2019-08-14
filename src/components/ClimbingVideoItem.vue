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
        s = "https://img.youtube.com/vi/" + this.youTubeId + "/mqdefault.jpg";
      }
      return s;
    }
  }
};
</script>

<style lang="scss">
.climbing-video-item {
  margin: 5px;
  padding: 5px;
  border: 2px solid #2c3e50;
  border-radius: 10px;
  background-color: #eef9fc;
  height: 240px;
  width: 348px;
  display: inline-block;

  img {
    display: inline 5px;
    margin: 5px;
    max-width: 320px;
    max-height: 180px;
    border: 3px solid #2c3e50;
  }

  a:hover img {
    border: 3px solid #9dad7f;
  }

  .video-desc {
    color: #2c3e50;
    margin: 5px;
  }
}
</style>
