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
      <ul style="list-style-type: none;">
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
        { name: "David Vasko", sandboxId: "david-vasko" },
        {
          name: "Chase Yamashiro",
          sandboxId: "shirley-girth",
        },
        { name: "Winifred Affleman", sandboxId: "winifred-affleman" },
        { name: "Akhil Mauze", sandboxId: "l-i-b" },
        { name: "Scott Barron", sandboxId: "dirk-irector" },
        { name: "Jacquie Nguyen", sandboxId: "natalie-udelarms" },
        { name: "Dustin Goldbarg", sandboxId: "scooter-limb" },
        {
          name: "Nathaniel Cushing-Murray",
          sandboxId: "chris-rush",
        },
        { name: "Im a Tiny Man", sandboxId: "ishmael-matinyman" },
        {
          name: "Daniel Fineman",
          sandboxId: "zev-fineman",
        },
        { name: "Daniel Fong", sandboxId: "fanny-dong" },
        { name: "Kody Shutt", sandboxId: "kody-shutt" },
        { name: "David Woo", sandboxId: "david-woo" },
        { name: "Aden Parker", sandboxId: "aden-parker" },
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
