const gradeMap = {
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

const typeMap = {
  rp: "redpoint",
  os: "onsite",
  f: "flash",
};

const fontToV = {
  "5A": "0",
  "5B": "1",
  "5C": "2",
  "6A": "3",
  "6A+": "3/4",
  "6B": "4",
  "6B+": "4/5",
  "6C": "5",
  "6C+": "5/6",
  "7A": "6",
  "7A+": "7",
  "7B": "7/8",
  "7B+": "8",
  "7C": "9",
  "7C+": "10",
  "8A": "11",
  "8A+": "12",
  "8B": "13",
  "8B+": "14",
  "8C": "15",
  "8C+": "16",
  "9a": "17",
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
    4: "4 Stars",
    5: "5 Stars",
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

// Area Name Map (new)
const areaNameFixes = {
  "Red Rock": "Red Rocks",
  Tuolumne: "Tuolumne Meadows",
};

// Manually maintained dictionary to get "country" + State
const areaMaps = {
  "mineral-king": { country: "United States", div1: "CA", div2: "Sequoia" },
  "rancho-penasquitos-canyon": {
    country: "United States",
    div1: "CA",
    div2: "San Diego",
  },
  "mt-woodson": { country: "United States", div1: "CA", div2: "San Diego" },
  "super-slab": { country: "United States", div1: "CA", div2: "Sonoma" },
  "salt-point": { country: "United States", div1: "CA", div2: "Sonoma" },
  "mount-baldy": { country: "United States", div1: "CA", div2: "Los Angeles" },
  "pomo-canyon": { country: "United States", div1: "CA", div2: "Sonoma" },
  tramway: { country: "United States", div1: "CA", div2: "San Jacinto" },
  bishop: { country: "United States", div1: "CA", div2: "Bishop" },
  "black-mountain": {
    country: "United States",
    div1: "CA",
    div2: "San Jacinto",
  },
  "marion-mountain": {
    country: "United States",
    div1: "CA",
    div2: "San Jacinto",
  },
  "tuolomne-meadows": {
    country: "United States",
    div1: "CA",
    div2: "Yosemite",
  },
  brickyard: { country: "United States", div1: "CA", div2: "Santa Barbara" },
  "joshua-tree": { country: "United States", div1: "CA", div2: "Joshua Tree" },
  yosemite: { country: "United States", div1: "CA", div2: "Yosemite" },
  "mt-tamalpais": {
    country: "United States",
    div1: "CA",
    div2: "San Fransisco",
  },
  "jupiter-boulders": {
    country: "United States",
    div1: "CA",
    div2: "San Jacinto",
  },
  "malibu-tunnel-boulders": {
    country: "United States",
    div1: "CA",
    div2: "Los Angeles",
  },
  "doomsday-boulders": { country: "United States", div1: "CA", div2: "" },
  "temporal-boulders": {
    country: "United States",
    div1: "CA",
    div2: "Los Angeles",
  },
  cazadero: { country: "United States", div1: "CA", div2: "Sonoma" },
  "the-depot": { country: "United States", div1: "OR", div2: "Bend" },
  telluride: { country: "United States", div1: "CO", div2: "Telluride" },
  "walker-ranch": { country: "United States", div1: "CO", div2: "Boulder" },
  klettergarden: { country: "United States", div1: "CO", div2: "Denver" },
  "barn-canyon": { country: "United States", div1: "NM", div2: "Gallup" },
  "waimea-bay-hi": { country: "United States", div1: "HI", div2: "Waimea Bay" },
  "joes-valley": { country: "United States", div1: "UT", div2: "Orangeville" },
  leavenworth: { country: "United States", div1: "WA", div2: "Leavenworth" },
  sasquatch: { country: "United States", div1: "WA", div2: "Seattle" },
  "service-boulder": {
    country: "United States",
    div1: "AK",
    div2: "Anchorage",
  },
  "idle-of-skye": {
    country: "United Kingdom",
    div1: "Scotland",
    div2: "Isle of Skye",
  },
  khajaguda: { country: "India", div1: "Telangana", div2: "Khajaguda" },
  "mobil-gas-station": {
    country: "United States",
    div1: "California",
    div2: "Lee Vining",
  },
};
const stateEquivalences = {
  CA: "California",
  OR: "Oregon",
  AK: "Alaska",
  WA: "Washington",
  NM: "New Mexico",
  HI: "Hawaii",
  UT: "Utah",
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
    /* {
      "date": "2016-05-28", 
      "type": "flash", 
      "name": "Emerald City", 
      "recommend": true, 
      "area": "TRAMWAY", 
      "subArea": "THE_BOARDWALK", 
      "country": "United States", 
      "state": "California", 
      "city": "San Jacinto", 
      "flags": ["flash"], 
      "comment": "One of the most beautiful rocks I've seen. The hike to it made it especially majestic an
        d the view from the top was like all an LIB could hope for. I had to lose the weight of my 
        sunglasses to get this send.", 
      "rating": 3, 
      "grade": "0"
    },
    */
    preprocessAscent(ascent, climber) {
      let newAscent = { ...ascent };

      newAscent.name = this.prettyCapitalize(ascent.zlaggableName);

      newAscent.commentLength = newAscent.comment
        ? newAscent.comment.length
        : 0;

      newAscent.flags = [];
      //new property for Soft, Hard, Neither
      let reldif =
        newAscent.isEasy || newAscent.isSoft
          ? "Soft"
          : newAscent.isHard
          ? "Hard"
          : "Neutral";
      newAscent.softness = reldif;
      if (reldif != "Neutral") {
        newAscent.flags.push(reldif);
      }

      // // Year and Month and Year are useful
      newAscent.date = newAscent.date.substring(0, 10);
      let date = this.decomposeDate(newAscent.date);
      newAscent.year = date.year;
      newAscent.month = date.month;
      newAscent.day = date.day;

      // // Day of week
      let jDate = new Date(newAscent.date + "T12:00:00Z");
      newAscent["dayOfWeek"] = jDate.getDay();

      // Climber Name
      newAscent["climber"] = climber;

      // Grade Conversion
      newAscent.grade = fontToV[newAscent.difficulty] || "B";

      if (newAscent.areaName) {
        newAscent.area = newAscent.areaName.replace(/ \([A-Z][A-Z]\)/, "");
        newAscent.subArea = newAscent.cragName;
      } else {
        newAscent.area = newAscent.cragName;
        newAscent.subArea = this.kebabToCap(newAscent.sectorSlug);
      }
      newAscent.area = areaNameFixes[newAscent.area] || newAscent.area;

      newAscent.type = typeMap[newAscent.type];
      newAscent.flags.push(newAscent.type);
      newAscent.country = this.kebabToCap(newAscent.countrySlug);

      if (newAscent.firstAscent) {
        newAscent.flags.push("FA");
      }

      if (newAscent.secondGo) {
        newAscent.flags.push("Second Go");
      }

      return newAscent;
    },
    fetchData(sandboxId) {
      // Pretend fetching... return as promise
      return new Promise((resolve, reject) => {
        fetch(`/json/8a-scorecards/${sandboxId}.json`)
          .then((raw) => {
            return raw.json();
          })
          .then((rawJson) => {
            const ascents = rawJson["ascents"].map((ascent) =>
              this.preprocessAscent(ascent, this.kebabToCap(sandboxId))
            );
            if (ascents.length) {
              resolve({ msg: "Success", data: ascents });
            } else {
              throw new Error("Ascents Were Empty");
            }
          })
          .catch((e) => {
            console.error(e);
            const ret = {
              msg: this.formatString(
                "Sandbox member data for [{0}] not avaliable",
                sandboxId
              ),
            };
            reject(ret);
          });
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
    /*
     * Time Series Functions
     */
    generateTimeSeries(ascents, opts) {
      // Set default options
      if (!opts) {
        opts = {};
      }
      if (!opts.nTop) {
        opts.nTop = 10;
      }
      let ts = undefined;
      if (ascents.length > 0) {
        ts = { day: [], month: [], year: [] };
        // Sort ascents with earliest ascent first
        ascents.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        let now = this.decomposeDate(ascents[0].date);
        let t = {
          date: {
            day: now.day,
            month: now.month,
            year: now.year,
          },
          run: {
            ...this.newTimeSeriesTracker(),
            sampledGrades: [],
            prevMax: 0,
            sinceMax: 0,
            prevMaxDate: undefined,
            sinceNewMax: 0,
            prevNewMaxDate: undefined,
          },
          day: this.newTimeSeriesTracker(),
          month: this.newTimeSeriesTracker(),
          year: this.newTimeSeriesTracker(),
        };
        for (let ascent of ascents) {
          // Check if we are same, and roll day, month, year counters if need be
          const cur = this.decomposeDate(ascent.date);
          if (cur.year == t.date.year) {
            if (cur.month == t.date.month) {
              if (cur.day == t.date.day) {
                // Same Day of climbing dont roll (fisrt time through this is guaranteed)
              } else {
                this.rollDay(t, ts, now);
              }
            } else {
              this.rollMonth(t, ts, now);
            }
          } else {
            this.rollYear(t, ts, now);
          }
          // now we know this is either a new day or the same day as last ascent
          t.date = { ...cur };
          const gradeNumerical = this.mapGrade(ascent.grade, 0);
          now = new Date(
            parseInt(t.date.year),
            parseInt(t.date.month) - 1,
            parseInt(t.date.day)
          );
          // Update Running tallies
          this.updateSinceMax(t, now, gradeNumerical, opts.comparisonGrade);
          this.updateTop(t.run.top, gradeNumerical, opts.nTop);
          this.updateValues(t.run, gradeNumerical, opts.nTop);
          if (opts.avgSamples > 0) {
            if (t.run.sampledGrades.length == opts.avgSamples) {
              t.run.sampledGrades.shift();
            }
            t.run.sampledGrades.push(gradeNumerical);
            t.run.avg =
              t.run.sampledGrades.reduce(function (a, b) {
                return a + b;
              }, 0) / t.run.sampledGrades.length;
          }
          // Update all top lists
          this.updateTop(t.day.top, gradeNumerical, opts.nTop);
          this.updateTop(t.month.top, gradeNumerical, opts.nTop);
          this.updateTop(t.year.top, gradeNumerical, opts.nTop);
          // Calculate the [Y] values
          this.updateValues(t.day, gradeNumerical, opts.nTop);
          this.updateValues(t.month, gradeNumerical, opts.nTop);
          this.updateValues(t.year, gradeNumerical, opts.nTop);
        }
        // final update
        this.rollYear(t, ts, now);
      }
      console.log("Time Series Data:", ts);
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
    updateValues(tsTracker, newValue, nTop, avgSamples) {
      tsTracker.cnt += 1;
      if (newValue == tsTracker.max) {
        tsTracker.numMax += 1;
      } else if (newValue > tsTracker.max) {
        tsTracker.numMax = 1;
      }
      tsTracker.max = Math.max(newValue, tsTracker.max);
      tsTracker.avg =
        (newValue + (tsTracker.cnt - 1) * tsTracker.avg) / tsTracker.cnt;
      tsTracker.score =
        tsTracker.top.reduce(function (a, b) {
          return a + b;
        }, 0) / Math.min(nTop, tsTracker.top.length);
    },
    updateSinceMax(t, now, gradeNumerical, comparisonGradeOpt) {
      const compGrade =
        comparisonGradeOpt > -1 ? comparisonGradeOpt : t.run.max;
      if (gradeNumerical >= compGrade) {
        if (gradeNumerical > compGrade) {
          t.run.prevNewMaxDate = new Date(now);
        }
        t.run.prevMaxDate = new Date(now);
      }
      if (t.run.prevMaxDate) {
        const diffTime = Math.abs(now - t.run.prevMaxDate);
        t.run.sinceMax = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      if (t.run.prevNewMaxDate) {
        const diffTime = Math.abs(now - t.run.prevNewMaxDate);
        t.run.sinceNewMax = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    },
    newTimeSeriesTracker() {
      return { top: [], max: 0, avg: 0, score: 0, numMax: 0, cnt: 0 };
    },
    rollYear(t, ts, now) {
      ts.year.push({
        x: new Date(parseInt(t.date.year), 12, 30),
        y: t.year,
      });
      t.year = this.newTimeSeriesTracker();
      this.rollMonth(t, ts, now);
    },
    rollMonth(t, ts, now) {
      ts.month.push({
        x: new Date(parseInt(t.date.year), parseInt(t.date.month) - 1, 28),
        y: t.month,
      });
      t.month = this.newTimeSeriesTracker();
      this.rollDay(t, ts, now);
    },
    rollDay(t, ts, now) {
      ts.day.push({
        x: new Date(now),
        y: t.day,
        yr: {
          ...t.run,
          prevMaxDate: new Date(t.run.prevMaxDate),
          top: [...t.run.top],
        },
      });
      t.day = this.newTimeSeriesTracker();
    },
    /*
     * Crossword Chart Data Builder
     */
    buildXwordChartData(data, seriesOpts) {
      let datasets = [];
      for (let seriesOpt of seriesOpts) {
        datasets.push({
          backgroundColor: seriesOpt.color,
          borderColor: seriesOpt.color,
          borderWidth: seriesOpt.borderWidth,
          label: seriesOpt.label,
          fill: false,
          pointRadius: 2,
          pointBackgroundColor: seriesOpt.color,
          pointBorderColor: seriesOpt.color,
          data: [],
        });
      }
      for (let datum of data) {
        for (let j = 0; j < seriesOpts.length; j++) {
          // remove duplicate values
          if (datasets[j].data.length > 0) {
            let prevY = datasets[j].data[datasets[j].data.length - 1].y;
            if (prevY === datum[j + 1]) {
              continue;
            }
          }
          datasets[j].data.push({ x: datum[0], y: datum[j + 1] });
        }
      }
      // add a final point at final time to make graphs go to end
      let tf = data[data.length - 1][0];
      for (let j = 0; j < seriesOpts.length; j++) {
        datasets[j].data.push({
          x: tf,
          y: datasets[j].data[datasets[j].data.length - 1].y,
        });
      }
      return {
        datasets: datasets,
      };
    },
  },
};
