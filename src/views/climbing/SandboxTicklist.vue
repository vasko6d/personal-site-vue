<script setup lang="ts">
import { useClimberTicklistStore } from '@/stores/useClimberTicklistStore'
import ClimberAscentTable from '@/components/climbing/ClimberAscentTable.vue'
import ClimberColumnSelect from '@/components/climbing/ClimberColumnSelect.vue'
import StatFilter from '@/components/climbing/StatFilter.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import type { ProcessedAscent } from '@/utils/Utils'

const store = useClimberTicklistStore()

store.fetchAll()
</script>

<template>
  <div id="boulder-scorecard">
    <h1>The Sandbox's Ticklist</h1>
    <div v-if="store.loading">
      <LoadingSpinner :size="64" />
      <div>{{ store.loadingMessage }}</div>
    </div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else class="flex-row">
      <div class="chart-w">
        <div class="chart-p bg1">
          <StatFilter
            :currentFilters="store.currentFilters"
            :stats="store.stats"
            :startExpanded="false"
            @clearFilters="store.clearFilters"
          />
        </div>
      </div>
      <ClimberColumnSelect
        :columns="store.columns"
        :labelMap="store.headings"
        @toggleActive="store.columns[$event.index]!.active = !store.columns[$event.index]!.active"
      >
      </ClimberColumnSelect>
    </div>
    <div v-show="!store.loading && !store.error">
      <ClimberAscentTable
        :columns="store.activeColumns"
        :values="store.currentFilteredStat.values as unknown as ProcessedAscent[]"
      ></ClimberAscentTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
@use '@/assets/styles/table-container';
#boulder-scorecard {
  display: inline-block;
  max-width: 1400px;
  @media only screen and (max-width: 1400px) {
    max-width: 100%;
  }
  .left {
    text-align: left;
  }
  overflow-x: auto;
}
</style>
