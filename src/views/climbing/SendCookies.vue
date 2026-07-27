<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSendCookiesStore } from '@/stores/useSendCookiesStore'
import { computeMonthlyLeaderboard, computeMonthlyCookieTimeSeries } from '@/utils/Cookies'
import { mapName } from '@/utils/Utils'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import CookieHolderBanner from '@/components/climbing/cookies/CookieHolderBanner.vue'
import CookieLeaderboard from '@/components/climbing/cookies/CookieLeaderboard.vue'
import CookieTimeSeriesChart from '@/components/climbing/cookies/CookieTimeSeriesChart.vue'
import CookieCalendar from '@/components/climbing/cookies/CookieCalendar.vue'
import ClimberDetailModal from '@/components/climbing/cookies/ClimberDetailModal.vue'
import CookieHelpModal from '@/components/climbing/cookies/CookieHelpModal.vue'

const props = defineProps<{
  year?: string
  month?: string
}>()

const router = useRouter()
const store = useSendCookiesStore()

store.fetchAll()

const isFiltered = computed(() => !!(props.year && props.month))
const yearMonth = computed(() =>
  isFiltered.value ? `${props.year}-${String(props.month).padStart(2, '0')}` : undefined,
)
const monthName = computed(() =>
  props.month ? (mapName('month', props.month.padStart(2, '0')) ?? props.month) : '',
)

// A month's leaderboard is a fixed historical tally (undecayed cookie
// points earned that month) - a different data shape than the live,
// decaying leaderboard, so it's computed separately rather than filtering
// the live one.
const monthlyLeaderboard = computed(() =>
  yearMonth.value ? computeMonthlyLeaderboard(store.allSends, yearMonth.value) : [],
)
const displayLeaderboard = computed(() => (isFiltered.value ? monthlyLeaderboard.value : store.leaderboard))
const displayHolder = computed(() => (isFiltered.value ? displayLeaderboard.value[0] : store.holder))
const bannerLabel = computed(() =>
  isFiltered.value ? `${monthName.value} ${props.year} Winner` : 'Current Cookie Holder',
)

// Filtered view still gets a time-series chart, just scoped to that month's
// own top-10 (rather than the live view's top-10) and plotted on a
// day-level axis instead of the 12-month view's month-level one.
const timeSeries = computed(() =>
  isFiltered.value
    ? computeMonthlyCookieTimeSeries(
        store.allSends,
        monthlyLeaderboard.value.slice(0, 10).map((e) => e.climber),
        yearMonth.value!,
      )
    : store.timeSeries,
)

function clearFilter() {
  router.push('/climbing/send-cookies')
}

function onMonthClick(clickedYearMonth: string) {
  const [y, m] = clickedYearMonth.split('-')
  router.push(`/climbing/send-cookies/${y}/${m}`)
}

const showHelp = ref(false)
const detailClimber = ref<string | null>(null)

function openClimberDetail(climber: string) {
  detailClimber.value = climber
}
</script>

<template>
  <div id="send-cookies">
    <h1>
      Send Cookies
      <i class="fas fa-question-circle icn" @click="showHelp = true"></i>
    </h1>
    <div v-if="isFiltered" class="filter-chip bg1">
      Filtered to {{ monthName }} {{ year }}
      <span class="clear-filter icn" @click="clearFilter">&times;</span>
    </div>
    <div v-if="store.loading">
      <LoadingSpinner :size="64" />
      <div>{{ store.loadingMessage }}</div>
    </div>
    <div v-else class="send-cookies-layout">
      <div class="area-banner">
        <CookieHolderBanner
          :holder="displayHolder"
          :label="bannerLabel"
          @click="displayHolder && openClimberDetail(displayHolder.climber)"
        />
      </div>
      <div class="area-leaderboard">
        <CookieLeaderboard :entries="displayLeaderboard" @climber-click="openClimberDetail" />
      </div>
      <div class="area-timeseries">
        <CookieTimeSeriesChart :series="timeSeries" :timeUnit="isFiltered ? 'day' : 'month'" />
      </div>
      <div class="area-calendar">
        <CookieCalendar
          :winners="store.monthlyWinners"
          :defaultYear="year"
          :activeYearMonth="yearMonth"
          @month-click="onMonthClick"
        />
      </div>
    </div>
    <ClimberDetailModal
      v-if="detailClimber"
      :climber="detailClimber"
      :allSends="store.allSends"
      :currentLevel="store.currentLevels.get(detailClimber)"
      :asOf="store.asOf"
      :yearMonth="yearMonth"
      @close="detailClimber = null"
    />
    <CookieHelpModal v-if="showHelp" @close="showHelp = false" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
@use '@/assets/styles/table-container';
#send-cookies {
  display: block;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
  h1 {
    .icn {
      font-size: 0.6em;
      cursor: pointer;
      vertical-align: middle;
    }
  }
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.4em 0.8em;
    margin-bottom: 1em;
    .clear-filter {
      cursor: pointer;
      font-weight: bold;
    }
  }
  // Same DOM order on every viewport - grid-template-areas alone controls
  // visual placement, so mobile just stacks in source order while desktop
  // rearranges into two columns without needing any reordering hacks.
  .send-cookies-layout {
    display: grid;
    gap: 10px;
    grid-template-areas:
      'banner'
      'leaderboard'
      'timeseries'
      'calendar';
    @media (min-width: 1000px) {
      grid-template-columns: 1fr 1.2fr;
      grid-template-areas:
        'banner leaderboard'
        'calendar leaderboard'
        'timeseries timeseries';
      align-items: start;
    }
  }
  .area-banner {
    grid-area: banner;
  }
  .area-leaderboard {
    grid-area: leaderboard;
  }
  .area-timeseries {
    grid-area: timeseries;
  }
  .area-calendar {
    grid-area: calendar;
  }
}
</style>
