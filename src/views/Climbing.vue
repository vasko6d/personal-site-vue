<template>
  <div id="climbing">
    <!-- this is a hardcoded list, woudl be better to do something like:
        https://www.raymondcamden.com/2018/08/01/adding-your-youtube-videos-to-your-static-site-with-vuejs
    -->
    <climbing-video-item you-tube-id="-u1w5VtMsWI" video-desc="Mt Woodson" />
    <climbing-video-item you-tube-id="osNdWTYSM7o" video-desc="Rocklands" />
    <climbing-video-item you-tube-id="eTJu9mOWVwA" video-desc="Leavenworth" />
    <climbing-video-item you-tube-id="xsQbE6G_dTY" video-desc="Sonoma Coast" />
    <climbing-video-item you-tube-id="oPQz11NzgD4" video-desc="Magic Wood" />
    <climbing-video-item you-tube-id="5YdARyxHnG0" video-desc="Zillertal" />
    <climbing-video-item
      you-tube-id="hsHRZywHtLI"
      video-desc="Chironico + Cresciano"
    />
    <climbing-video-item you-tube-id="rnyxV-3R8ho" video-desc="Scotland" />
    <climbing-video-item you-tube-id="fsmt-qtqHXc" video-desc="Fontainebleau" />
    <climbing-video-item you-tube-id="MNAmClG5qpM" video-desc="Peak District" />
    <climbing-video-item you-tube-id="czhjYF5BVgo" video-desc="Bounders  4" />
    <climbing-video-item you-tube-id="rRoMCjaqTGY" video-desc="Bounders 3" />
    <climbing-video-item you-tube-id="DGBJrHYObsc" video-desc="Bounders 2" />
    <climbing-video-item you-tube-id="_bFMmASz2j4" video-desc="Bounders 1" />
    <climbing-video-item you-tube-id="uhnSAFp4QuU" video-desc="Squamish 1" />
    <climbing-video-item you-tube-id="hPSi-8C36Ho" video-desc="Squamish 2" />
    <climbing-video-item you-tube-id="Ew57orF9g4c" video-desc="Joes Valley" />
    <climbing-video-item you-tube-id="BC-3mz0bT7g" video-desc="Tramway" />
    <climbing-video-item you-tube-id="-34f0FZRRaI" video-desc="Tramway" />
    <climbing-video-item
      video-url="https://player.vimeo.com/video/126732198"
      img-url="https://i.vimeocdn.com/video/517272841_640.jpg"
      video-desc="Bishop"
    />
    <climbing-video-item
      you-tube-id="75flgdpk-eU"
      video-desc="Black Mountain"
    />
    <!-- Had trouble with dynamically loading the image as described here:
         https://github.com/vuejs-templates/pwa/issues/42, 
         therefore I moved to static folder for now
    -->
    <climbing-video-item
      video-url="https://drive.google.com/file/d/0B903aI0TyENqYVpzWEVVTlk1ZkE/preview"
      img-url="img/peabody-highline.jpg"
      video-desc="Peabody Highline"
    />
  </div>
</template>

<script>
import ClimbingVideoItem from "@/components/ClimbingVideoItem.vue";

export default {
  name: "climbing",
  components: {
    ClimbingVideoItem
  }
};
</script>

<style lang="scss">
#climbing {
  display: inline-block;
  max-width: 1200px;
}
</style>
