<script setup lang="ts">
import { computed, ref } from "vue";

interface TopoImage {
  title: string;
  size: string;
  imageUrl: string;
}

interface Topo {
  title: string;
  description: string;
  pdfPath?: string;
  videoUrl?: string;
  imageUrl: string;
  mpUrl?: string;
  a8Url?: string;
  rawTopoImages?: TopoImage[];
}

const topos: Record<string, Topo> = {
  rpc: {
    title: "RPC (Rancho Penasquitos Canyon)",
    description:
      "I never climbed at RPC until 2019 and for a small local area it has some serious merit. After all " +
      "my developing in late 2019 the area has about 50 total problems ranging dramatically in quality " +
      "I wont go into too much detail as the Mountain Project for RPC is pretty comprehensive. A viedo is in the works," +
      " and will hopefully be finished by mid June. Still need to send 'Estate Tax'!",
    pdfPath: "/pdf/rpc-guide.pdf",
    videoUrl: undefined,
    imageUrl: "/img/rpc.jpg",
    mpUrl: "https://www.mountainproject.com/area/107926127/rancho-penasquitos-canyon",
    a8Url: "https://www.8a.nu/crags/bouldering/united-states/rancho-penasquitos-canyon/routes",
    rawTopoImages: [
      {
        title: "Overview Topo",
        size: "4.8 mb",
        imageUrl: "/img/rpc-topo.png",
      },
      {
        title: "Main Falls",
        size: "2.0 mb",
        imageUrl: "/img/rpc-topo-main-falls.png",
      },
      {
        title: "Lower Falls",
        size: "1.4 mb",
        imageUrl: "/img/rpc-topo-lower-falls.png",
      },
      {
        title: "Mr. Longarm",
        size: "1.6 mb",
        imageUrl: "/img/rpc-topo-mr-longarm.png",
      },
    ],
  },
  mk: {
    title: "Mineral King",
    description:
      "Mineral King is simply incredible. I have not made a topo yet but I will slowly start to compile some helpful information here",
    pdfPath: undefined,
    videoUrl: "https://www.youtube.com/playlist?list=PLXZ2k01bhGF95i4HPsXTfD2z0Dc6pKO9c",
    imageUrl: "/img/mk.jpg",
    a8Url: "https://www.8a.nu/crags/bouldering/united-states/mineral-king/routes",
    rawTopoImages: undefined,
  },
};

const showTopoImages = ref(false);

const props = defineProps<{
  topoId?: string;
}>();
const currentTopo = computed(() => (props.topoId ? topos[props.topoId] : undefined));
</script>

<template>
  <div id="climbing-topos">
    <div class="bg1" v-if="currentTopo">
      <h3>
        {{ currentTopo.title }}
      </h3>
      <img :src="currentTopo.imageUrl" />
      <div class="desc-container">
        <div class="desc">{{ currentTopo.description }}</div>
      </div>
      <div class="flex-row">
        <a v-if="currentTopo.pdfPath" :href="currentTopo.pdfPath" target="_blank" class="icn bg1-hvr dv-btn">
          <i class="fas fa-file"> Topo</i>
        </a>
        <a v-if="currentTopo.mpUrl" :href="currentTopo.mpUrl" target="_blank" class="icn bg1-hvr dv-btn">
          <i class="fas fa-mountain"> Mountain Project</i>
        </a>
        <a v-if="currentTopo.a8Url" :href="currentTopo.a8Url" target="_blank" class="icn bg1-hvr dv-btn">
          <i class="fas fa-clipboard-check"> 8a.nu</i>
        </a>
        <a v-if="currentTopo.videoUrl" :href="currentTopo.videoUrl" target="_blank" class="icn bg1-hvr dv-btn">
          <i class="fas fa-video"> Video</i>
        </a>
        <div
          v-if="currentTopo.rawTopoImages"
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
            <li v-for="topoImg in currentTopo.rawTopoImages" :key="topoImg.imageUrl" class="icn">
              <a :href="topoImg.imageUrl" download>
                <i class="fas fa-download"> {{ topoImg.title }} ({{ topoImg.size }})</i>
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
          <router-link :to="'/climbing/topos/' + key">{{ topo.title }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

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
