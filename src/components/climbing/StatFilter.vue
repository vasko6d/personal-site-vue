<template>
  <div class="stat-filter">
    <div class="b">
      <span class="icn" @click="showFilters = !showFilters">
        Filters
        <i
          :class="{
            fas: true,
            'fa-angle-down': !showFilters,
            'fa-angle-up': showFilters,
          }"
        ></i> </span
      >&nbsp;
      <i
        v-show="showFilters"
        class="fas fa-eraser icn"
        @click="$emit('clearFilters')"
        v-tooltip="'Clear All Filters'"
      ></i
      >&nbsp;
      <i
        v-show="showFilters"
        :class="{
          fas: true,
          icn: true,
          'fa-plus': !addingFilter,
        }"
        @click="addingFilter = !addingFilter"
        v-tooltip="'Add Filter'"
      ></i>
    </div>
    <div
      class="b bg1"
      style="margin-top: 0.5em; padding-top: 0.25em"
      v-show="addingFilter && showFilters"
    >
      <div class="flex-row">
        <span class="fstatic"></span>
        <span class="fgrow">Choose Filter to add</span>
        <span class="fstatic topx">
          <i
            class="fas fa-window-close icn"
            @click="(addingFilter = !addingFilter), (filterToAdd = null)"
            v-tooltip="'Close'"
          ></i>
        </span>
      </div>
      <div>
        <select v-model="filterToAdd" @change="addFilter()">
          <option :value="null">Select Filter</option>
          <option v-for="fil in addableFilters" :key="fil.id" :value="fil">
            {{ prettyCapitalize(fil) }}
          </option>
        </select>
      </div>
    </div>
    <div v-show="showFilters">
      <div
        v-for="catagory in Object.keys(currentFilters)"
        :key="catagory.id"
        v-show="currentFilters[catagory].show"
      >
        <div class="flex-row">
          <span class="filter-txt">{{ prettyCapitalize(catagory) }} =</span>
          <!-- eslint-disable-next-line vue/no-mutating-props -->
          <select class="flex-gs" v-model="currentFilters[catagory].val">
            <option :value="null">All</option>
            <option
              v-for="opt in filterOpts[catagory]"
              :key="opt.id"
              :value="opt.raw"
            >
              {{ opt.label }}
            </option>
          </select>
          <!--<i class="fas fa-cogs icn filter-txt"></i>&nbsp;&nbsp;-->
          <i
            class="fas fa-eraser icn filter-txt"
            @click="$emit('clearFilters', catagory)"
          ></i>
          <i
            class="fas fa-trash icn filter-txt"
            @click="deleteFitler(catagory)"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Stat from "@/mixins/Stat.js";
import Utils from "@/mixins/Utils.js";
export default {
  mixins: [Utils],
  data() {
    return {
      showFilters: true,
      addingFilter: false,
      filterToAdd: null,
    };
  },
  props: {
    currentFilters: Object,
    stats: Stat,
    startExpanded: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    currentFilteredStat() {
      return this.stats.getFiltered(false, this.currentFilters);
    },
    addableFilters() {
      let ret = [];
      let cats = Object.keys(this.currentFilters);
      for (let cat of cats) {
        if (!this.currentFilters[cat].show) {
          ret.push(cat);
        }
      }
      return ret;
    },
    filterOpts() {
      let ret = {};
      let cats = Object.keys(this.currentFilters);
      for (const cat of cats) {
        let limitOpts = this.currentFilters[cat].val != null;
        let s = limitOpts ? this.stats : this.currentFilteredStat;
        let choices = [];
        let rawNames = Object.keys(s.get(cat).subStats);
        if (cat === "grade") {
          rawNames.sort((a, b) => {
            return this.mapGrade(a) - this.mapGrade(b);
          });
        } else {
          rawNames.sort();
        }
        for (let rawName of rawNames) {
          choices.push({
            raw: rawName,
            label: this.truncateString(this.mapName(cat, rawName), 15),
          });
        }
        ret[cat] = choices;
      }
      return ret;
    },
  },
  methods: {
    truncateString(str, num) {
      if (str.length <= num) {
        return str;
      }
      return str.slice(0, num) + "...";
    },
    addFilter() {
      if (this.filterToAdd != null) {
        // eslint-disable-next-line vue/no-mutating-props
        this.currentFilters[this.filterToAdd].show = true;
      }
    },
    deleteFitler(catToDelete) {
      // eslint-disable-next-line vue/no-mutating-props
      this.currentFilters[catToDelete].show = false;
      // eslint-disable-next-line vue/no-mutating-props
      this.currentFilters[catToDelete].val = null;
    },
  },
  mounted() {
    this.showFilters = this.startExpanded;
  },
};
</script>

<style lang="scss" scoped>
.filter-txt {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.flex-row {
  .fstatic {
    flex-basis: 20px;
  }
  .fgrow {
    flex-grow: 1;
  }
  margin-right: 0.5em;
  margin-left: 0.5em;
}
.topx {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
