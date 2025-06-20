<template>
  <div id="ascent-table">
    <div>
      <button @click="showConfirm = true">Export to CSV</button>
    </div>
    <div v-if="showConfirm" class="confirm-dialog">
      <div class="confirm-content">
        <p>
          Are you sure you want to export these [{{ values.length }}] ascents to
          CSV?
        </p>
        <button
          @click="
            downloadCSV(values);
            showConfirm = false;
          "
        >
          Current Columns
        </button>
        <button
          @click="
            downloadCSV(values, false);
            showConfirm = false;
          "
        >
          All Data
        </button>
        <button @click="showConfirm = false">Cancel</button>
      </div>
    </div>
    <div class="table-container">
      <v-client-table
        ref="vuetable"
        :columns="columns"
        :data="values"
        :options="options"
        @row-click="rowClick"
      >
        <div slot="date" slot-scope="props">
          {{ props.row.date.replace(/-/g, "&#8209;") }}
        </div>
        <div slot="grade" slot-scope="props">V{{ props.row.grade }}</div>
        <div slot="flags" slot-scope="props">
          {{ props.row.flags.join(", ") }}
        </div>
        <div slot="recommend" slot-scope="props">
          <i v-if="props.row.recommend" class="fas fa-thumbs-up"></i>
        </div>
        <div slot="comment" slot-scope="props">
          <div class="left" v-html="props.row.comment"></div>
        </div>
      </v-client-table>
    </div>
  </div>
</template>

<script>
import Utils from "@/mixins/Utils.js";
export default {
  props: {
    values: Array,
    columns: Array,
  },
  mixins: [Utils],
  data() {
    return {
      showConfirm: false,
      options: {
        headings: {
          climber: "Climber",
          date: "Date",
          type: "Type",
          grade: "Grade",
          name: "Name",
          rating: "Stars",
          recommend: "Recommend",
          area: "Area",
          subArea: "SubArea",
          flags: "Flags",
          comment: "Comment",
        },
        pagination: {
          chunk: 5,
        },
        perPage: 100,
        perPageValues: [10, 25, 50, 100, 500, 2000],
        sortable: [
          "climber",
          "date",
          "type",
          "grade",
          "name",
          "recommend",
          "rating",
          "area",
          "subArea",
          "flags",
          "comment",
        ],
        filterable: [
          "climber",
          "date",
          "type",
          "grade",
          "name",
          "rating",
          "area",
          "subArea",
          "flags",
          "comment",
        ],
        sortIcon: {
          base: "fas",
          is: "",
          up: "fa-caret-up",
          down: "fa-caret-down",
        },
        orderBy: { column: "date", ascending: false },
        customSorting: {
          grade: (ascending) => {
            return (a, b) => {
              if (ascending) {
                return this.mapGrade(a.grade) - this.mapGrade(b.grade);
              }
              return this.mapGrade(b.grade) - this.mapGrade(a.grade);
            };
          },
          comment: (ascending) => {
            return (a, b) => {
              if (ascending) {
                return a.commentLength - b.commentLength;
              }
              return b.commentLength - a.commentLength;
            };
          },
        },
      },
    };
  },
  methods: {
    rowClick(e) {
      const url = `https://www.8a.nu/crags/bouldering/${e.row.countrySlug}/${e.row.cragSlug}/sectors/${e.row.sectorSlug}/routes/${e.row.zlaggableSlug}`;
      console.log("Opening external 8a.nu url: ", url);
      window.open(url, "_blank");
    },
    convertToCSV(data, activeColumnsOnly = true) {
      const escapeCSV = (value) => {
        if (value === undefined || value === null) return "";
        let str = String(value);
        // Double quotes inside the field must be doubled
        str = str.replace(/"/g, '""');
        // If the field contains a comma, newline, or double quote, wrap it in double quotes
        if (/[",\n\r]/.test(str)) {
          str = `"${str}"`;
        }
        return str;
      };

      const csvRows = [];
      const headers = activeColumnsOnly ? this.columns : Object.keys(data[0]);
      csvRows.push(headers.join(","));

      for (const row of data) {
        const values = headers.map((header) => {
          let cell = row[header];
          if (Array.isArray(cell)) cell = cell.join(", ");
          return escapeCSV(cell);
        });
        csvRows.push(values.join(","));
      }

      return csvRows.join("\n");
    },
    downloadCSV(data, activeColumnsOnly = true) {
      const csv = this.convertToCSV(data, activeColumnsOnly);

      // Get current datetime in YYYY-MM-DD_HH-mm-ss format
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
        now.getSeconds()
      )}`;
      const filename = `ascents_${datetime}.csv`;

      console.log("Downloading CSV: ", filename);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/styles/wrapper.scss";
@import "@/assets/styles/table-container.scss";
#ascent-table {
  display: inline-block;
  max-width: 1400px;
  @media only screen and (max-width: 1400px) {
    max-width: 100%;
  }
  .left {
    text-align: left;
  }
  overflow-x: auto;
  .confirm-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    .confirm-content {
      background: #fff;
      padding: 2em;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      text-align: center;
      button {
        margin: 0 1em;
      }
    }
  }
}
</style>
