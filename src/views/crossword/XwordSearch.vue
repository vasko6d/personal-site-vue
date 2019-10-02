<template>
  <div id="xword-search">
    <div class="blk-container">
      <h2>Select a Crossword</h2>
      <v-table :data="rawXwords" id="xwords">
        <thead slot="head">
          <th>Title</th>
          <th>Author</th>
          <th>Difficulty (1-10)</th>
          <th>Create Date</th>
          <th>Dimension</th>
          <th>Status</th>
        </thead>
        <tbody slot="body" slot-scope="{ displayData }">
          <tr
            v-for="row in displayData"
            :key="row.id"
            @click="$router.push('' + row.id)"
          >
            <td>{{ row.title }}</td>
            <td>{{ row.author }}</td>
            <td>{{ row.difficulty }}</td>
            <td>{{ toDateString(row.createDate) }}</td>
            <td>{{ row.dimension }}</td>
            <td>{{ getStatus(row.id) }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script>
// Xword Data Source Imports
import Xword1 from "@/assets/xword/Xword1.vue";
import Xword2 from "@/assets/xword/Xword2.vue";
import Xword3 from "@/assets/xword/Xword3.vue";

export default {
  name: "XwordSearch",
  data() {
    return {
      rawXwords: [Xword1.data().xword, Xword2.data().xword, Xword3.data().xword]
    };
  },
  methods: {
    toDateString(yyyymmdd) {
      return new Date(
        parseInt(yyyymmdd.substring(0, 4)),
        parseInt(yyyymmdd.substring(4, 6)) - 1,
        parseInt(yyyymmdd.substring(6, 8))
      ).toDateString();
    },
    getStatus(id) {
      const lsKey = "xword:" + id;
      if (localStorage[lsKey]) {
        if (localStorage[lsKey] === "completed") {
          return "Completed";
        }
        return "Started";
      }
      return "Not Started";
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/dark-theme.scss";
.blue {
  @import "@/assets/styles/blue-theme.scss";
}
.dark {
  @import "@/assets/styles/dark-theme.scss";
}
.light {
  @import "@/assets/styles/light-theme.scss";
}
#xword-search {
  #xwords {
    border-collapse: collapse;
    width: 100%;
    td,
    th {
      padding: 8px;
    }

    tr:last-child {
      td:first-child {
        border-bottom-left-radius: 0.5em;
      }
      td:last-child {
        border-bottom-right-radius: 0.5em;
      }
    }

    th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: center;
      &:first-child {
        border-top-left-radius: 0.5em;
      }
      &:last-child {
        border-top-right-radius: 0.5em;
      }
    }
  }
}
</style>
