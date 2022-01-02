import Stat from "./Stat";

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
  "16": 16,
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
  "9A": "17",
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

// Distinct Colors
const distinctColors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#000000",
];

// Manually maintained dictionary to get "country" + State
const areaMaps = {
  "bishop-ca": { div1: "CA", div2: "Bishop" },
  "black-mountain-ca": {
    div1: "CA",
    div2: "San Jacinto",
  },
  "joshua-tree-ca": { div1: "CA", div2: "Joshua Tree" },
  "tramway-ca": { div1: "CA", div2: "San Jacinto" },
};
/*
{
  "barn-canyon": { div1: "NM", div2: "Gallup" },
  brickyard: { div1: "CA", div2: "Santa Barbara" },
  cazadero: { div1: "CA", div2: "Sonoma" },
  "doomsday-boulders": { div1: "CA", div2: "" },
  "idle-of-skye": {
    country: "United Kingdom",
    div1: "Scotland",
    div2: "Isle of Skye",
  },
  "joes-valley": { div1: "UT", div2: "Orangeville" },
  "jupiter-boulders": {
    div1: "CA",
    div2: "San Jacinto",
  },
  leavenworth: { div1: "WA", div2: "Leavenworth" },
  khajaguda: { country: "India", div1: "Telangana", div2: "Khajaguda" },
  klettergarden: { div1: "CO", div2: "Denver" },
  "malibu-tunnel-boulders": {
    div1: "CA",
    div2: "Los Angeles",
  },
  "marion-mountain": {
    div1: "CA",
    div2: "San Jacinto",
  },
  "mineral-king": { div1: "CA", div2: "Sequoia" },
  "mobil-gas-station": {
    div1: "CA",
    div2: "Lee Vining",
  },
  "mount-baldy": { div1: "CA", div2: "Los Angeles" },
  "mt-woodson": { div1: "CA", div2: "San Diego" },
  "mt-tamalpais": {
    div1: "CA",
    div2: "San Fransisco",
  },
  "pomo-canyon": { div1: "CA", div2: "Sonoma" },
  "rancho-penasquitos-canyon": {
    div1: "CA",
    div2: "San Diego",
  },
  "salt-point": { div1: "CA", div2: "Sonoma" },
  sasquatch: { div1: "WA", div2: "Seattle" },
  "service-boulder": {
    div1: "AK",
    div2: "Anchorage",
  },
  "super-slab": { div1: "CA", div2: "Sonoma" },
  telluride: { div1: "CO", div2: "Telluride" },
  "temporal-boulders": {
    div1: "CA",
    div2: "Los Angeles",
  },
  "the-depot": { div1: "OR", div2: "Bend" },
  "tuolomne-meadows": {
    div1: "CA",
    div2: "Yosemite",
  },
  yosemite: { div1: "CA", div2: "Yosemite" },
  "walker-ranch": { div1: "CO", div2: "Boulder" },
  "waimea-bay-hi": { div1: "HI", div2: "Waimea Bay" },
}
*/

// var hideLog = {};

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
    getDistinctColor(index) {
      if (index < distinctColors.length) return distinctColors[index];
      else return this.getRandomColor();
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
    /*
    Process the RAW JSON from 81.nu into dv format:

      RAW: {
        "ascentId": 6012919,
        "areaName": "Bishop (CA)",
        "areaSlug": "bishop-ca",
        "cragName": "Sad Boulders",
        "cragSlug": "sad-boulders",
        "sectorSlug": "unknown-sector-79fad",
        "zlaggableName": "The Ninth Wave",
        "zlaggableSlug": "the-ninth-wave",
        "countrySlug": "united-states",
        "userAvatar": "gallery/44437.jpg",
        "userName": "Gregor recian-God",
        "userSlug": "david-vasko",
        "date": "2020-12-11T12:00:00+00:00",
        "difficulty": "7B+",
        "gradeIndex": 26,
        "comment": "Lubba dubba dub dub!!! I did it boys! I did the thing! Not the thing over there, but this thing!",
        "isPrivateComment": false,
        "traditional": false,
        "project": false,
        "isHard": false,
        "isSoft": false,
        "firstAscent": false,
        "secondGo": false,
        "type": "rp",
        "notes": "Lubba dubba dub dub!!! I did it boys! I did the thing! Not the thing over there, but this thing!",
        "rating": 4
      }

      PROCESSED: {
        "area": "Bishop",
        "climber": "David Vasko",
        "comment": "Lubba dubba dub dub!!! I did it boys! I did the thing! Not the thing over there, but this thing!",
        "commentLength": 96,
        "date": "2020-12-11",
        "day": "11",
        "dayOfWeek": 5,
        "name": "The Ninth Wave",
        "firstAscent": false,
        "flags": [
          "redpoint"
        ],
        "grade": "8",
        "isHard": false,
        "isSoft": false,
        "month": "12",
        "rating": 4,
        "type": "redpoint",
        "secondGo": false,
        "softness": "Neutral",
        "subArea": "Sad Boulders"
        "year": "2020",
      }
    */
    preprocessAscent(ascent, climber) {
      const processedAscent = {
        area: ascent.area,
        climber: climber,
        comment: ascent.comment,
        commentLength: ascent.comment ? ascent.comment.length : 0,
        countrySlug: ascent.countrySlug,
        cragSlug: ascent.cragSlug,
        name: ascent.zlaggableName,
        country: this.kebabToCap(ascent.countrySlug),
        date: undefined,
        day: undefined,
        dayOfWeek: undefined,
        // div1: undefined,
        // div2: undefined,
        firstAscent: ascent.firstAscent,
        flags: [],
        grade: fontToV[ascent.difficulty] || "B", // grade conversion
        isHard: ascent.isHard,
        isSoft: ascent.isSoft,
        month: undefined,
        rating: ascent.rating,
        recommend: !!ascent.recommended, // 8a changed their response...
        secondGo: ascent.secondGo,
        sectorSlug: ascent.sectorSlug,
        softness: undefined,
        subArea: undefined,
        type: typeMap[ascent.type],
        year: undefined,
        zlaggableSlug: ascent.zlaggableSlug,
      };

      // New property "softness" = Soft, Hard, Neither
      const reldif =
        ascent.isEasy || ascent.isSoft
          ? "Soft"
          : ascent.isHard
          ? "Hard"
          : "Neutral";
      processedAscent.softness = reldif;

      // Add "Hard" or "soft" as a flag
      if (reldif != "Neutral") {
        processedAscent.flags.push(reldif);
      }

      // Year and Month and Year are useful
      processedAscent.date = ascent.date.substring(0, 10);
      const date = this.decomposeDate(processedAscent.date);
      processedAscent.year = date.year;
      processedAscent.month = date.month;
      processedAscent.day = date.day;

      // // Day of week
      const jDate = new Date(processedAscent.date + "T12:00:00Z");
      processedAscent["dayOfWeek"] = jDate.getDay();

      // Correct Area and Sub Area
      let areaSlug = ascent.areaSlug;
      if (ascent.areaName) {
        processedAscent.area = ascent.areaName.replace(/ \([A-Z][A-Z]\)/, "");
        processedAscent.subArea = ascent.cragName;
      } else {
        processedAscent.area = ascent.cragName;
        processedAscent.subArea = this.kebabToCap(ascent.sectorSlug);
        areaSlug = ascent.cragSlug;
      }
      processedAscent.area =
        areaNameFixes[processedAscent.area] || processedAscent.area;

      // Add a few more flags
      processedAscent.flags.push(processedAscent.type);

      if (ascent.firstAscent) processedAscent.flags.push("FA");
      if (ascent.secondGo) processedAscent.flags.push("Second Go");
      if (ascent.isOverhang) processedAscent.flags.push("isOverhang");
      if (ascent.isVertical) processedAscent.flags.push("isVertical");
      if (ascent.isSlab) processedAscent.flags.push("isSlab");
      if (ascent.isRoof) processedAscent.flags.push("isRoof");
      if (ascent.isAthletic) processedAscent.flags.push("isAthletic");
      if (ascent.isEndurance) processedAscent.flags.push("isEndurance");
      if (ascent.isCrimpy) processedAscent.flags.push("isCrimpy");
      if (ascent.isCruxy) processedAscent.flags.push("isCruxy");
      if (ascent.isSloper) processedAscent.flags.push("isSloper");
      if (ascent.isTechnical) processedAscent.flags.push("isTechnical");
      if (ascent.isDanger) processedAscent.flags.push("isDanger");
      if (ascent.withKneepad) processedAscent.flags.push("withKneepad");

      // DIVS - for state adn city or province city etc
      // const divs = areaMaps[areaSlug];
      // if (!divs) {
      //   const logkey = "COUNTRY:DNE:" + areaSlug;
      //   if (hideLog[logkey] === undefined) {
      //     console.warn(
      //       `Crag [${areaSlug}] does not have a valid area to Location Map so Country and State not found`
      //     );
      //     hideLog[logkey] = true;
      //   }
      //}

      return processedAscent;
    },
    fetchData(sandboxId) {
      // Pretend fetching... return as promise
      return new Promise((resolve, reject) => {
        fetch(`/json/8a-scorecards/${sandboxId}.json`)
          .then((raw) => resolve(raw.json()))
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
      const statList = Object.values(stat.subStats);
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
      let datasets;
      if (opts.splitStat) {
        // Apply a "split function"
        datasets = [];
        const topSets = [];
        const maxSplits = opts.splitLimit;

        // First pass find all the buckets - TODO: do this in one pass
        filteredList.forEach((stat) => {
          const statsToSplit = Object.values(stat.get(opts.splitStat).subStats);
          statsToSplit.sort((a, b) => b.count - a.count);
          const limit = Math.min(statsToSplit.length, maxSplits);
          const topSet = new Set();
          for (let i = 0; i < limit; i++) {
            const splitStat = statsToSplit[i];
            topSet.add(splitStat.name);
            if (datasets.find((ds) => ds.name === splitStat.name)) continue;
            datasets.push({
              label: this.mapName(opts.splitStat, splitStat.name, opts.nameMap),
              name: splitStat.name,
              data: [],
              backgroundColor: this.getDistinctColor(datasets.length),
            });
          }
          topSets.push(topSet);
        });

        // Second pass fill all the buckets
        filteredList.forEach((stat, index) => {
          const statsToSplit = stat.get(opts.splitStat).subStats;
          const topSet = topSets[index];
          datasets.forEach((ds) => {
            let el = statsToSplit[ds.name] || new Stat(ds.name);
            if (!topSet.has(ds.name)) el = new Stat(ds.name);
            ds.data.push(opts.aggregateFxn ? opts.aggregateFxn(el) : el.count);
          });
        });
      }
      // apply aggregate function
      filteredList.forEach(
        (el) =>
          (el["datum"] = opts.aggregateFxn ? opts.aggregateFxn(el) : el.count)
      );
      // Add Color - To allow constant colors on update allow a passed color object
      filteredList.forEach((el, index) => {
        if (opts.colors) {
          // Add to the color options if we find ourself a elemnt we dont have yet
          if (!opts.colors[el.label]) {
            opts.colors[el.label] = this.getDistinctColor(index);
          }
          el["color"] = opts.colors[el.label];
        } else {
          el["color"] = this.getDistinctColor(index);
        }
      });
      // Sort data
      let defaultSort = opts.sortByName
        ? (a, b) => (a.name > b.name ? 1 : -1)
        : (a, b) => b.datum - a.datum;
      filteredList.sort(opts.sortFxn || defaultSort);
      // Apply limit if passed
      if (opts.limit) filteredList = filteredList.slice(0, opts.limit);
      // Return it in ChartJS format
      return {
        datasets: datasets || [
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
          backgroundColor: "#e6c530", // Yellow
        },
      ];
      for (let grade of gradeList) {
        const types = grade.get("type", allowExpansion);
        let cnt = 0;
        if (opts && opts.filters && opts.filters.type.val === "redpoint") {
          cnt = grade.count;
        } else if (types.get("redpoint", allowExpansion)) {
          cnt = types.get("redpoint", allowExpansion).count;
        }
        datasets[0].data.push(cnt);

        cnt = 0;
        if (opts && opts.filters && opts.filters.type.val === "flash") {
          cnt = grade.count;
        } else if (types.get("flash", allowExpansion)) {
          cnt = types.get("flash", allowExpansion).count;
        }
        datasets[1].data.push(cnt);

        cnt = 0;
        if (opts && opts.filters && opts.filters.type.val === "onsite") {
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
