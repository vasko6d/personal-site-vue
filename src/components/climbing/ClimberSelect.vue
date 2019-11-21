<template>
  <div>
    <div>
      <div class="icn b" @click="showClimbers = !showClimbers">
        Climber Select
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showClimbers,
            'fa-angle-up': showClimbers
          }"
        ></i>
      </div>
    </div>
    <div v-show="showClimbers" class="flex-row">
      <ul style="list-style-type:none ">
        <li
          class="icn"
          @click="navigate(climber.sandboxId)"
          v-for="climber in importedClimbers"
          :key="climber.id"
        >
          {{ climber.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    baseURL: String
  },
  data() {
    return {
      showClimbers: false,
      importedClimbers: [
        {
          name: "Chase Yamashiro",
          sandboxId: "chase-yamashiro"
        },
        { name: "David Vasko", sandboxId: "david-vasko" },
        { name: "Scott Baron", sandboxId: "scott-baron" },
        {
          name: "Nathaniel Cushing-Murray",
          sandboxId: "nathaniel-cushing-murray"
        },
        { name: "Drew Gomberg", sandboxId: "drew-gomberg" },
        {
          name: "Daniel Fineman",
          sandboxId: "daniel-fineman"
        },
        { name: "Daniel Fong", sandboxId: "daniel-fong" }
      ]
    };
  },
  methods: {
    navigate(sandboxId) {
      if (this.sandboxId != sandboxId) {
        this.$router.push(this.baseURL + sandboxId);
      }
    }
  }
};
</script>
