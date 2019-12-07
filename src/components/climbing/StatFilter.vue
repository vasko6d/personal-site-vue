<template>
  <div class="stat-filter">
    <div class="b">
      <span class="icn" @click="showFilters = !showFilters">
        Filters
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showFilters,
            'fa-angle-up': showFilters
          }"
        ></i> </span
      >&nbsp;
      <i
        v-show="showFilters"
        class="fas fa-eraser icn"
        @click="$emit('clearFilters')"
      ></i>
    </div>
    <div v-show="showFilters">
      <div v-for="catagory in Object.keys(currentFilters)" :key="catagory.id">
        <div class="flex-row">
          <span class="filter-txt">{{ catagory }} =</span>
          <select class="filter-drop" v-model="currentFilters[catagory]">
            <option :value="null">All</option>
            <option
              v-for="val in (currentFilters[catagory] != null
                ? stats
                : currentFilteredStat
              ).get(catagory).subStats"
              :key="val.id"
              :value="val.name"
              >{{ truncateString(val.name.toString(), 17) }}</option
            > </select
          >&nbsp;
          <i
            class="fas fa-eraser icn filter-txt"
            @click="$emit('clearFilters', catagory)"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
export default {
  data() {
    return {
      showFilters: true
    };
  },
  props: {
    currentFilters: Object,
    stats: Stat,
    startExpanded: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    currentFilteredStat() {
      return this.stats.getFiltered(false, this.currentFilters);
    }
  },
  methods: {
    truncateString(str, num) {
      if (str.length <= num) {
        return str;
      }
      return str.slice(0, num) + "...";
    }
  },
  mounted() {
    this.showFilters = this.startExpanded;
  }
};
</script>

<style lang="scss" scoped>
.filter-txt {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.filter-drop {
  flex-grow: 1;
  flex-shrink: 1;
}
</style>
