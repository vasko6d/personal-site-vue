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
.climbing-video-item {
  margin: 5px;
  padding: 5px;
  border: 3px solid #2c3e50;
  border-radius: 10px;
  background-color: #ffffff;
  height: 240px;
  width: 348px;
  display: inline-block;

  img {
    display: inline 5px;
    margin: 5px;
    max-width: 320px;
    max-height: 180px;
    border: 2px solid #2c3e50;
  }

  .video-desc {
    color: #2c3e50;
    font-weight: bold;
    text-decoration: none;
    margin: 5px;
  }
}
.climbing-video-item:hover {
  border: 3px solid #9dad7f;
}
.climbing-video-item:visited {
  background-color: #bbf0ff;
}
</style>
