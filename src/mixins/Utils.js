var gradeMap = {
  B: -1,
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "3/4": 3.5,
  "4": 4,
  "4/5": 4.5,
  "5": 5,
  "5/6": 5.5,
  "6": 6,
  "7": 7,
  "7/8": 7.5,
  "8": 8,
  "9": 9,
  "10": 10,
  "11": 11,
  "12": 12,
  "13": 13,
  "14": 14,
  "15": 15,
};

const nameMaps = {
  month: {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  },
  rating: {
    0: "0 Stars",
    1: "1 Star",
    2: "2 Stars",
    3: "3 Stars",
  },
  dayOfWeek: {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  },
  recommend: {
    true: "Recommended",
    false: "Not Recommended",
  },
};

export default {
  name: "utils",
  methods: {
    getRandomColor() {
      var letters = "0123456789ABCDEF".split("");
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    formatString(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
      });
    },
    mapName(statName, nameToMap, nameMap = false) {
      if (nameMap) {
        return nameMap[nameToMap];
      } else if (nameMaps[statName]) {
        return nameMaps[statName][nameToMap];
      }
      return nameToMap;
    },
    mapGrade(grade, minVal = -10, sys = "V") {
      // V or font will eventually be supported
      if (sys === "V") {
        return Math.max(gradeMap[grade], minVal);
      }
    },
    makeInt(catagory, value) {
      let ret =
        catagory === "grade" ? this.mapGrade(value, 0) : parseInt(value);
      //console.log(catagory + " - " + value + " - " + ret);
      return ret;
    },
    vScale(grade) {
      return "V" + grade;
    },
    kebabToCap(str) {
      return str
        .split("-")
        .map((w) => w[0].toUpperCase() + w.substr(1))
        .join(" ");
    },
    preprocessAscents(ascents, climber) {
      for (let ascent of ascents) {
        ascent["commentLength"] = ascent["comment"].length;
        //new property for Soft, Hard, Neither
        let reldif = "Neutral";
        for (const flag of ascent["flags"]) {
          switch (flag) {
            case "Soft":
            case "Hard":
              reldif = flag;
              break;
          }
        }
        ascent["softness"] = reldif;

        // Year and Month and Year are useful
        let date = this.decomposeDate(ascent["date"]);
        ascent["year"] = date.year;
        ascent["month"] = date.month;
        ascent["day"] = date.day;

        // Day of week
        let jDate = new Date(ascent["date"] + "T12:00:00Z");
        ascent["dayOfWeek"] = jDate.getDay();

        // Climber Name
        ascent["climber"] = climber;
      }
    },
    fetchData(sandboxId) {
      // Pretend fetching...
      let ascents = [];
      switch (sandboxId) {
        case "david-vasko":
          ascents = require("@/assets/json/8a-scorecards/david-vasko.json")[
            "ascents"
          ];
          break;
        case "chase-yamashiro":
          ascents = require("@/assets/json/8a-scorecards/chase-yamashiro.json")[
            "ascents"
          ];
          break;
        case "jacquie-nguyen":
          ascents = require("@/assets/json/8a-scorecards/jacquie-nguyen.json")[
            "ascents"
          ];
          break;
        case "scott-baron":
          ascents = require("@/assets/json/8a-scorecards/scott-baron.json")[
            "ascents"
          ];
          break;
        case "nathaniel-cushing-murray":
          ascents = require("@/assets/json/8a-scorecards/nathaniel-cushing-murray.json")[
            "ascents"
          ];
          break;
        case "drew-gomberg":
          ascents = require("@/assets/json/8a-scorecards/drew-gomberg.json")[
            "ascents"
          ];
          break;
        case "daniel-fong":
          ascents = require("@/assets/json/8a-scorecards/daniel-fong.json")[
            "ascents"
          ];
          break;
        case "daniel-fineman":
          ascents = require("@/assets/json/8a-scorecards/daniel-fineman.json")[
            "ascents"
          ];
          break;
        case "akhil-mauze":
          ascents = require("@/assets/json/8a-scorecards/akhil-mauze.json")[
            "ascents"
          ];
          break;
        case "kody-shutt":
          ascents = require("@/assets/json/8a-scorecards/kody-shutt.json")[
            "ascents"
          ];
          break;
        case "dustin-goldbarg":
          ascents = require("@/assets/json/8a-scorecards/dustin-goldbarg.json")[
            "ascents"
          ];
          break;
      }
      // return as promise
      return new Promise((resolve, reject) => {
        if (ascents.length > 0) {
          this.preprocessAscents(ascents, this.kebabToCap(sandboxId));
          const ret = {
            msg: "Success",
            data: ascents,
          };
          resolve(ret);
        } else {
          const ret = {
            msg: this.formatString(
              "Sandbox member data for [{0}] not avaliable",
              sandboxId
            ),
          };
          reject(ret);
        }
      });
    },
    prettyCapitalize(str) {
      return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
        return str.toUpperCase();
      });
    },
    getPieChartData(stat, opts) {
      let statList = Object.values(stat.subStats);
      // Filter is given a filter function (shallow copy)
      let filteredList = [...statList];
      if (opts.filterFxn) {
        filteredList = filteredList.filter(opts.filterFxn);
      }
      // Add Label
      filteredList.forEach((el) => {
        el["label"] = this.mapName(stat.name, el.name, opts.nameMap);
      });
      // Add actual data for that point
      filteredList.forEach((el) => {
        if (opts.aggregateFxn) {
          el["datum"] = opts.aggregateFxn(el);
        } else {
          el["datum"] = el.count;
        }
      });
      // Add Color - To allow constant colors on update allow a passed color object
      filteredList.forEach((el) => {
        if (opts.colors) {
          // Add to the color options if we find ourself a elemnt we dont have yet
          if (!opts.colors[el.label]) {
            opts.colors[el.label] = this.getRandomColor();
          }
          el["color"] = opts.colors[el.label];
        } else {
          el["color"] = this.getRandomColor();
        }
      });
      // Sort data
      let defaultSort = opts.sortByName
        ? (a, b) => (a.name > b.name ? 1 : -1)
        : (a, b) => b.datum - a.datum;
      filteredList.sort(opts.sortFxn || defaultSort);
      // Apply limit if passed
      if (opts.limit) {
        filteredList = filteredList.slice(0, opts.limit);
      }
      // Return it in ChartJS format
      return {
        datasets: [
          {
            data: filteredList.map((el) => {
              return el.datum;
            }),
            backgroundColor: filteredList.map((el) => {
              return el.color;
            }),
          },
        ],
        labels: filteredList.map((el) => {
          return el.label;
        }),
        names: filteredList.map((el) => {
          return el.name;
        }),
      };
    },
    getTimeChartData(ts, opts) {
      if (ts) {
        let ts2 = ts.day.map((el) => {
          return { x: el.x, y: el.yr.sinceMax };
        });
        console.log(ts2);
      }

      // Return it in ChartJS format
      return {
        datasets: [
          {
            data: [],
            backgroundColor: "#6d826c",
            borderColor: "#6d826c",
            borderWidth: 2,
            label: "Days Since Max",
            fill: false,
            pointRadius: 2,
            pointBackgroundColor: "#6d826c",
            pointBorderColor: "#6d826c",
          },
        ],
      };
    },
    getGradeChartData(stat, allowExpansion = true, opts) {
      let gradeList = Object.values(stat.subStats);
      gradeList.sort((a, b) => {
        return gradeMap[a.name] - gradeMap[b.name];
      });
      let datasets = [
        {
          label: "Redpoint",
          data: [],
          backgroundColor: "#D70909", // Red
        },
        {
          label: "Flash",
          data: [],
          backgroundColor: "#006DDB", // Blue
        },
        {
          label: "Onsite",
          data: [],
          backgroundColor: "#3C0707", // Black-Red
        },
      ];
      for (let grade of gradeList) {
        const types = grade.get("type", allowExpansion);
        let cnt = 0;
        if (opts && opts.filters && opts.filters.type === "redpoint") {
          cnt = grade.count;
        } else if (types.get("redpoint", allowExpansion)) {
          cnt = types.get("redpoint", allowExpansion).count;
        }
        datasets[0].data.push(cnt);

        cnt = 0;
        if (opts && opts.filters && opts.filters.type === "flash") {
          cnt = grade.count;
        } else if (types.get("flash", allowExpansion)) {
          cnt = types.get("flash", allowExpansion).count;
        }
        datasets[1].data.push(cnt);

        cnt = 0;
        if (opts && opts.filters && opts.filters.type === "onsite") {
          cnt = grade.count;
        } else if (types.get("onsite", allowExpansion)) {
          cnt = types.get("onsite", allowExpansion).count;
        }
        datasets[2].data.push(cnt);
      }
      return {
        datasets: datasets,
        labels: gradeList.map((k) => {
          return "V" + k.name;
        }),
        names: gradeList.map((k) => {
          return k.name;
        }),
      };
    },
    decomposeDate(dateStr) {
      return {
        day: dateStr.substring(8, 10),
        month: dateStr.substring(5, 7),
        year: dateStr.substring(0, 4),
      };
    },
    generateTimeSeries(ascents, nTop = 10) {
      console.log(`Generating Time Series Data>`);
      let ts = undefined;
      if (ascents.length > 0) {
        ts = { day: [], month: [], year: [] };
        // Sort ascents with earliest ascent first
        ascents.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        let startDate = this.decomposeDate(ascents[0].date);
        let t = {
          date: {
            day: startDate.day,
            month: startDate.month,
            year: startDate.year,
          },
          cnt: 0,
          run: {
            ...this.newTimeSeriesTracker(),
            sinceMax: 0,
            prevMaxDate: undefined,
          },
          day: this.newTimeSeriesTracker(),
          month: this.newTimeSeriesTracker(),
          year: this.newTimeSeriesTracker(),
        };
        for (let ascent of ascents) {
          // new Loop values
          const cur = this.decomposeDate(ascent.date);
          const now = new Date(
            parseInt(cur.year),
            parseInt(cur.month) - 1,
            parseInt(cur.day)
          );
          const gradeNumerical = this.mapGrade(ascent.grade);
          // Update since max
          if (gradeNumerical >= t.run.max) {
            t.run.prevMaxDate = now;
          } else if (t.run.prevMaxDate) {
            const diffTime = Math.abs(now - t.run.prevMaxDate);
            t.run.sinceMax = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
          // Check if we are same, and roll day, month, year counters if need be
          if (cur.year === t.date.year) {
            if (cur.month === t.date.month) {
              if (cur.day === t.date.day) {
              } else {
                this.rollDay(t, ts);
              }
            } else {
              this.rollMonth(t, ts);
            }
          } else {
            this.rollYear(t, ts);
          }
          t.date = cur;
          // Update all top lists
          this.updateTop(t.day.top, gradeNumerical, nTop);
          this.updateTop(t.month.top, gradeNumerical, nTop);
          this.updateTop(t.year.top, gradeNumerical, nTop);
          this.updateTop(t.run.top, gradeNumerical, nTop);
          // Calculate the [Y] values
          this.updateValues(t.day, gradeNumerical, nTop);
          this.updateValues(t.month, gradeNumerical, nTop);
          this.updateValues(t.year, gradeNumerical, nTop);
          this.updateValues(t.run, gradeNumerical, nTop);
        }
        // final update
        this.rollYear(t, ts);
      }

      return ts;
    },
    updateTop(topList, newValue, nTop) {
      if (topList.length < nTop) {
        topList.push(newValue);
      } else if (topList[nTop - 1] < newValue) {
        topList.pop();
        topList.push(newValue);
      }
      topList.sort((a, b) => b - a);
    },
    updateValues(tsTracker, newValue, nTop) {
      tsTracker.cnt += 1;
      tsTracker.max = Math.max(newValue, tsTracker.max);
      tsTracker.avg =
        (newValue + (tsTracker.cnt - 1) * tsTracker.avg) / tsTracker.cnt;
      tsTracker.score =
        tsTracker.top.reduce(function (a, b) {
          return a + b;
        }, 0) / Math.min(nTop, tsTracker.top.length);
      tsTracker.numMax = tsTracker.top.filter((v) => v == tsTracker.max).length;
    },
    newTimeSeriesTracker() {
      return { top: [], max: 0, avg: 0, score: 0, numMax: 0, cnt: 0 };
    },
    rollYear(t, ts) {
      ts.year.push({
        x: new Date(parseInt(t.date.year), 12, 30),
        y: t.year,
      });
      t.year = this.newTimeSeriesTracker();
      this.rollMonth(t, ts);
    },
    rollMonth(t, ts) {
      ts.month.push({
        x: new Date(parseInt(t.date.year), parseInt(t.date.month) - 1, 28),
        y: t.month,
      });
      t.month = this.newTimeSeriesTracker();
      this.rollDay(t, ts);
    },
    rollDay(t, ts) {
      ts.day.push({
        x: new Date(
          parseInt(t.date.year),
          parseInt(t.date.month) - 1,
          parseInt(t.date.day)
        ),
        y: t.day,
        yr: {
          ...t.run,
          prevMaxDate: new Date(t.run.prevMaxDate),
          top: [...t.run.top],
        },
      });
      t.day = this.newTimeSeriesTracker();
    },
  },
};
