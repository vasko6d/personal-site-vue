<template>
  <div id="climbing-topos">
    <div class="bg1" v-if="topoId && topos[topoId]">
      <h3>
        {{ topos[topoId].title }}
      </h3>
      <img :src="topos[topoId].imageUrl" />
      <div class="desc-container">
        <div class="desc">{{ topos[topoId].description }}</div>
      </div>
      <div class="flex-row">
        <a
          v-if="topos[topoId].pdfPath"
          :href="topos[topoId].pdfPath"
          target="_blank"
          class="icn bg1-hvr dv-btn"
        >
          <i class="fas fa-file"> Topo</i>
        </a>
        <a
          v-if="topos[topoId].mpUrl"
          :href="topos[topoId].mpUrl"
          target="_blank"
          class="icn bg1-hvr dv-btn"
        >
          <i class="fas fa-mountain"> Mountain Project</i>
        </a>
        <a
          v-if="topos[topoId].a8Url"
          :href="topos[topoId].a8Url"
          target="_blank"
          class="icn bg1-hvr dv-btn"
        >
          <i class="fas fa-clipboard-check"> 8a.nu</i>
        </a>
        <a
          v-if="topos[topoId].videoUrl"
          :href="topos[topoId].videoUrl"
          target="_blank"
          class="icn bg1-hvr dv-btn"
        >
          <i class="fas fa-video"> Video</i>
        </a>
        <div
          v-if="topos[topoId].rawTopoImages"
          class="icn bg1-hvr dv-btn"
          @click="showTopoImages = !showTopoImages"
        >
          <i class="fas fa-image"> Topo Images </i>&nbsp;<i
            :class="{
              'fas fa-angle-down': !showTopoImages,
              'fas fa-angle-up': showTopoImages,
            }"
          ></i>
        </div>
      </div>
      <div v-if="showTopoImages">
        <div class="desc">
          <ul class="no-bullet">
            <li
              v-for="topoImg in topos[topoId].rawTopoImages"
              :key="topoImg.id"
              class="icn"
            >
              <a :href="topoImg.imageUrl" download>
                <i class="fas fa-download">
                  {{ topoImg.title }} ({{ topoImg.size }})</i
                >
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="bg1">
      <h4>Avaliable Topos</h4>
      <ul class="no-bullet">
        <li v-for="(topo, key) in topos" :key="key">
          <router-link :to="'/climbing/topos/' + key">{{
            topo.title
          }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "climbing-topos",
  props: {
    topoId: String,
  },
  data() {
    return {
      topos: {
        rpc: {
          title: "RPC (Rancho Penasquitos Canyon)",
          description:
            "I never climbed at RPC until 2019 and for a small local area it has some serious merit. After all " +
            "my developing in late 2019 the area has about 50 total problems ranging dramatically in quality " +
            "I wont go into too much detail as the Mountain Project for RPC is pretty comprehensive. A viedo is in the works," +
            " and will hopefully be finished by mid June. Still need to send 'Estate Tax'!",
          pdfPath: "/pdf/rpc-guide.pdf",
          videoUrl: undefined,
          imageUrl: "../../img/rpc.jpg",
          mpUrl:
            "https://www.mountainproject.com/area/107926127/rancho-penasquitos-canyon",
          a8Url:
            "https://www.8a.nu/crags/bouldering/united-states/rancho-penasquitos-canyon/routes",
          rawTopoImages: [
            {
              title: "Overview Topo",
              size: "4.8 mb",
              imageUrl: "../../img/rpc-topo.png",
            },
            {
              title: "Main Falls",
              size: "2.0 mb",
              imageUrl: "../../img/rpc-topo-main-falls.png",
            },
            {
              title: "Lower Falls",
              size: "1.4 mb",
              imageUrl: "../../img/rpc-topo-lower-falls.png",
            },
            {
              title: "Mr. Longarm",
              size: "1.6 mb",
              imageUrl: "../../img/rpc-topo-mr-longarm.png",
            },
          ],
        },
        mk: {
          title: "Mineral King",
          description:
            "Mineral King is simply incredible. I have not made a topo yet but I will slowly start to compile some helpful information here",
          pdfPath: undefined,
          videoUrl:
            "https://www.youtube.com/playlist?list=PLXZ2k01bhGF95i4HPsXTfD2z0Dc6pKO9c",
          imageUrl: "../../img/mk.jpg",
          a8Url:
            "https://www.8a.nu/crags/bouldering/united-states/mineral-king/routes",
          rawTopoImages: undefined,
        },
      },
      showTopoImages: false,
    };
  },
  methods: {
    fetchImage(imagePath) {
      console.log(`Fetching Image: ${imagePath}`);
      //fetch(imagePath);
    },
  },
};
</script>

<style lang="scss" scoped>
#climbing-topos {
  max-width: 750px;
  margin: auto;
  display: flex;
  flex-direction: column;
}
.bg1 {
  margin: 5px;
  padding: 10px;
}
.icon-font {
  font-family: Impact, Charcoal, sans-serif;
}
.dv-btn {
  padding: 5px;
  margin: 5px;
}
.desc-container {
  display: flex;
  justify-content: center;
}
.desc {
  text-align: left;
  width: 90%;
}
.no-bullet {
  list-style-type: none;
}
img {
  width: 100%;
}
</style>
