<template>
  <div>
    <div>
      <div class="b">
        <span class="icn" @click="showClimbers = !showClimbers">
          Climber Select
          <i
            :class="{
              fas: true,
              'fa-angle-down': !showClimbers,
              'fa-angle-up': showClimbers,
            }"
          ></i>
        </span>
      </div>
    </div>
    <div v-show="showClimbers" class="flex-row">
      <ul style="list-style-type: none">
        <li
          class="icn"
          @click="navigate(climber.sandboxId)"
          v-for="climber in importedClimbers"
          :key="climber.id"
        >
          {{ climber.name }}
        </li>
        <li v-if="linkToJsonAnalysis">...</li>
        <li
          v-if="linkToJsonAnalysis"
          class="icn"
          @click="$router.push('/climbing/import/analytics')"
        >
          Import Json File
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    baseURL: String,
    linkToJsonAnalysis: Boolean,
  },
  data() {
    return {
      showClimbers: false,
      importedClimbers: [
        { name: "G. Recian-God", sandboxId: "david-vasko" },
        { name: "C. Haarmed", sandboxId: "dirk-irector" },
        { name: "M. Agzag", sandboxId: "munin-agzag" },
        { name: "B. Iscuit", sandboxId: "bella-iscuit" },
        {
          name: "Shirley",
          sandboxId: "shirley-girth",
        },
        { name: "大 师兄", sandboxId: "da-shi-xiong" },
        { name: "W. Affleman", sandboxId: "winifred-affleman" },
        { name: "Im a Tiny Man", sandboxId: "ishmael-matinyman" },
        { name: "David Woo", sandboxId: "d-w" },
        { name: "B. Alznurmouth", sandboxId: "bernd-alznurmouth" },
        { name: "Hal", sandboxId: "hal-ford" },
        { name: "Aden Parker", sandboxId: "aden-parker" },
        { name: "LIB", sandboxId: "l-i-b" },
        { name: "N. Udlearms", sandboxId: "natalie-udelarms" },
        { name: "S. Limb", sandboxId: "scooter-limb" },
        {
          name: "Nathaniel Cushing-Murray",
          sandboxId: "chris-rush",
        },
        {
          name: "Ryan Bauer",
          sandboxId: "ryan-bauer",
        },
        {
          name: "Pinch Nick",
          sandboxId: "pinch-nick",
        },
        {
          name: "Daniel Fineman",
          sandboxId: "zev-fineman",
        },
        { name: "Daniel Fong", sandboxId: "fanny-dong" },
        { name: "Kody Shutt", sandboxId: "kody-shutt" },
      ],
    };
  },
  methods: {
    navigate(sandboxId) {
      if (this.sandboxId != sandboxId) {
        this.$router.push(this.baseURL + sandboxId);
      }
    },
  },
};
</script>
