<script setup lang="ts">
import ModalDialog from '@/components/shared/ModalDialog.vue'
import {
  LEVEL_STEP_MONTHS,
  COOKIE_BASE_MULTIPLIER,
  COOKIE_ACTIVE_MONTHS,
  COOKIE_MAX_PER_SEND,
} from '@/utils/Cookies'

defineEmits<{
  close: []
}>()
</script>

<template>
  <ModalDialog title="How Send Cookies Work" @close="$emit('close')">
    <h3>Your Level</h3>
    <p>
      Your level is your hardest send, held constant - it only drops by one grade for every
      {{ LEVEL_STEP_MONTHS }} calendar months you go without matching or beating it. Send that
      grade (or harder) again and the clock resets.
    </p>
    <h3>Cookies per Send</h3>
    <p>
      Every send is scored against your level <em>at the time</em> (not with hindsight from later
      sends). If <code>diff</code> is how many grades above your level a send was, you earn
      <code>floor({{ COOKIE_BASE_MULTIPLIER }} &times; 2<sup>diff</sup>)</code> cookies, capped at
      {{ COOKIE_MAX_PER_SEND }} per send:
    </p>
    <ul>
      <li>2 grades below your level: 1 cookie</li>
      <li>1 grade below your level: 2 cookies</li>
      <li>At your level: {{ COOKIE_BASE_MULTIPLIER }} cookies</li>
      <li>1 grade above your level: {{ COOKIE_BASE_MULTIPLIER * 2 }} cookies</li>
      <li>2 grades above your level: {{ COOKIE_BASE_MULTIPLIER * 4 }} cookies</li>
    </ul>
    <h3>Cookie Expiration</h3>
    <p>
      A send's cookies stay at full value for
      {{ COOKIE_ACTIVE_MONTHS }} calendar month{{ COOKIE_ACTIVE_MONTHS === 1 ? '' : 's' }} after you
      climbed it, then drop to 0 - the leaderboard total only counts recent sends.
    </p>
    <h3>Monthly Winner</h3>
    <p>
      Independent of the live leaderboard: whoever earned the most fresh cookie points from sends
      dated in a given calendar month wins that month, shown in the calendar below.
    </p>
  </ModalDialog>
</template>

<style scoped>
/* The app-wide .wrapper { text-align: center } centers li text but leaves
   the bullet marker anchored to the list's own box (list-style-position:
   outside is the default), producing bullet-then-big-gap-then-centered-text
   - same fix App.vue's global .blk-container ul already uses elsewhere. */
ul {
  text-align: left;
  margin: 20px 40px
}
li {
  text-align: left;
}
</style>
