<script setup lang="ts">
import { useSendCookiesStore } from '@/stores/useSendCookiesStore'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import CookieHolderBanner from '@/components/climbing/cookies/CookieHolderBanner.vue'
import CookieLeaderboard from '@/components/climbing/cookies/CookieLeaderboard.vue'
import CookieCalendar from '@/components/climbing/cookies/CookieCalendar.vue'

const store = useSendCookiesStore()

store.fetchAll()
</script>

<template>
  <div id="send-cookies">
    <h1>Send Cookies</h1>
    <div v-if="store.loading">
      <LoadingSpinner :size="64" />
      <div>{{ store.loadingMessage }}</div>
    </div>
    <template v-else>
      <CookieHolderBanner :holder="store.holder" />
      <CookieLeaderboard :entries="store.leaderboard" />
      <CookieCalendar :winners="store.monthlyWinners" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/wrapper';
@use '@/assets/styles/table-container';
#send-cookies {
  display: inline-block;
  max-width: 1400px;
  @media only screen and (max-width: 1400px) {
    max-width: 100%;
  }
  overflow-x: auto;
}
</style>
