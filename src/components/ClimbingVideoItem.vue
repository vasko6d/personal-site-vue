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
$nav-txt: #9dad7f;
$brdr: #303820;

.climbing-video-item {
  margin: 5px;
  padding: 5px;
  border: 3px solid $brdr;
  border-radius: 10px;
  background-color: rgba(lighten($nav-txt, 15%), 0.7);
  height: 240px;
  width: 348px;
  display: inline-block;
  color: #222;
  text-decoration: none;
  font-weight: bold;

  img {
    display: inline 5px;
    margin: 5px;
    max-width: 320px;
    max-height: 180px;
    border: 2px solid $brdr;
  }
}
.climbing-video-item:hover {
  border: 3px solid darken($nav-txt, 8%);
}
.climbing-video-item:visited {
  background-color: darken($nav-txt, 15%);
}
</style>
