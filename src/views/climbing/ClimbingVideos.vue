<template>
  <div id="climbing-videos">
    <!-- this is a hardcoded list, woudl be better to do something like:
        https://www.raymondcamden.com/2018/08/01/adding-your-youtube-videos-to-your-static-site-with-vuejs
    -->
    <climbing-video-item
      v-for="videoItem in videoList"
      :key="videoItem.id"
      :youTubeId="videoItem['ytid']"
      :videoDesc="videoItem['desc']"
      :videoUrl="videoItem['videoUrl']"
      :imgUrl="videoItem['imgUrl']"
    ></climbing-video-item>
  </div>
</template>

<script>
import ClimbingVideoItem from "@/components/climbing/ClimbingVideoItem.vue";

export default {
  name: "climbingvideos",
  components: {
    ClimbingVideoItem,
  },
  data() {
    return {
      videoList: [
        { ytid: "sUvxtaG_0yY", desc: "Mt Woodson: Vol. 2" },
        { ytid: "-u1w5VtMsWI", desc: "Mt Woodson: Vol. 1" },
        { ytid: "yz7znPQ4EZQ", desc: "V7 - Apollo Wept - First Ascent" },
        { ytid: "GyEgVEw8sVs", desc: "Black Mountain 2024" },
        { ytid: "--WXrR_kzHQ", desc: "Black Mountain: Archives" },
        { ytid: "b7XTOl92sF8", desc: "Lake Ramona" },
        { ytid: "h01kUPKnrTA", desc: "Bounders 6" },
        { ytid: "kiuiZn6tRok", desc: "Bounders 5" },
        { ytid: "czhjYF5BVgo", desc: "Bounders 4" },
        { ytid: "rRoMCjaqTGY", desc: "Bounders 3" },
        { ytid: "DGBJrHYObsc", desc: "Bounders 2" },
        { ytid: "f_gBeXyvZbU", desc: "Bounders 1 (full)" },
        { ytid: "_bFMmASz2j4", desc: "Bounders 1" },
        { ytid: "_U80DQPPp5Q", desc: "RPC" },
        { ytid: "LY7X8vQ7A4k", desc: "Leavenworth 2019" },
        { ytid: "eTJu9mOWVwA", desc: "Leavenworth 2018" },
        { ytid: "AfUtHT4jVmE", desc: "Alaska" },
        { ytid: "8-BJxEmLveU", desc: "Joshua Tree" },
        { ytid: "osNdWTYSM7o", desc: "Rocklands" },
        { ytid: "xsQbE6G_dTY", desc: "Sonoma Coast" },
        { ytid: "oPQz11NzgD4", desc: "Magic Wood" },
        { ytid: "5YdARyxHnG0", desc: "Zillertal" },
        { ytid: "hsHRZywHtLI", desc: "Chironico + Cresciano" },
        { ytid: "rnyxV-3R8ho", desc: "Scotland" },
        { ytid: "fsmt-qtqHXc", desc: "Fontainebleau" },
        { ytid: "MNAmClG5qpM", desc: "Peak District" },
        { ytid: "uhnSAFp4QuU", desc: "Squamish 1" },
        { ytid: "hPSi-8C36Ho", desc: "Squamish 2" },
        { ytid: "Ew57orF9g4c", desc: "Joes Valley" },
        { ytid: "BC-3mz0bT7g", desc: "Tramway" },
        { ytid: "-34f0FZRRaI", desc: "Tramway" },
        {
          videoUrl: "https://player.vimeo.com/video/126732198",
          imgUrl: "https://i.vimeocdn.com/video/517272841_640.jpg",
          desc: "Bishop",
        },
        { ytid: "75flgdpk-eU", desc: "Black Mountain" },
        {
          // Had trouble with dynamically loading the image as described here:
          // https://github.com/vuejs-templates/pwa/issues/42, therefore I moved to static folder for now
          videoUrl:
            "https://drive.google.com/file/d/0B903aI0TyENqYVpzWEVVTlk1ZkE/preview",
          imgUrl: "../img/peabody-highline.jpg",
          desc: "Peabody Highline",
        },
      ],
    };
  },
};
</script>

<style lang="scss">
#climbing-videos {
  display: inline-block;
  max-width: 1200px;
}
</style>
