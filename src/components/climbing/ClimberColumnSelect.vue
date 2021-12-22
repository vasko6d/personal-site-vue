<template>
  <div class="chart-w">
    <div class="chart-p bg1">
      <div class="b">
        <span class="icn" @click="showColumnFlags = !showColumnFlags">
          Column Select
          <i
            :class="{
              fas: true,
              'fa-angle-down': !showColumnFlags,
              'fa-angle-up': showColumnFlags,
            }"
          ></i>
        </span>
      </div>
      <div v-show="showColumnFlags" class="VuePagination col-opts">
        <div>
          <ul class="flex-row">
            <li
              :class="{ active: col.active }"
              class="col-btn"
              v-for="(col, index) in columns"
              :key="col.id"
              @click="
                $emit('toggleActive', {
                  index,
                  column: col,
                })
              "
            >
              {{ labelMap[col.name] }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: Array,
    labelMap: Object,
  },
  data() {
    return {
      showColumnFlags: false,
    };
  },
  methods: {},
};
</script>
