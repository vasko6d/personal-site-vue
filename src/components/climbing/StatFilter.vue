<template>
  <div class="stat-filter">
    <h2>
      Filters&nbsp;
      <i
        :class="{
          fas: true,
          icn: true,
          'fa-angle-down': !showFilters,
          'fa-angle-up': showFilters
        }"
        @click="showFilters = !showFilters"
      ></i
      >&nbsp;
      <i
        v-show="showFilters"
        class="fas fa-eraser icn"
        @click="$emit('clearFilters')"
      ></i>
    </h2>
    <div v-show="showFilters">
      <div v-for="catagory in Object.keys(currentFilters)" :key="catagory.id">
        <div class="flex-row">
          <span class="filter-txt">{{ catagory }} =</span>
          <select class="filter-drop" v-model="currentFilters[catagory]">
            <option :value="null">All</option>
            <option
              v-for="val in (currentFilters[catagory]
                ? stats
                : currentFilteredStat
              ).get(catagory).subStats"
              :key="val.id"
              :value="val.name"
              >{{ val.name }}</option
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
    stats: Stat
  },
  computed: {
    currentFilteredStat() {
      return this.stats.getFiltered(false, this.currentFilters);
    }
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
