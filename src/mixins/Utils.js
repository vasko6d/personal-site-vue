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
  "15": 15
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
    "12": "December"
  },
  rating: {
    0: "0 Stars",
    1: "1 Star",
    2: "2 Stars",
    3: "3 Stars"
  },
  recommend: {
    true: "Recommended",
    false: "Not Recommended"
  }
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
      return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
      });
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
        .map(w => w[0].toUpperCase() + w.substr(1))
        .join(" ");
    },
    standardizeAreaName(area) {
      let standArea = area
        .toUpperCase()
        .trim()
        .replace(/\s+/g, "_");
      return standArea;
    },
    preprocessAscents(ascents) {
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
          this.preprocessAscents(ascents);
          const ret = {
            msg: "Success",
            data: ascents
          };
          resolve(ret);
        } else {
          const ret = {
            msg: this.formatString(
              "Sandbox member data for [{0}] not avaliable",
              sandboxId
            )
          };
          reject(ret);
        }
      });
    },
    prettyCapitalize(str) {
      return str.replace(/([A-Z])/g, " $1").replace(/^./, function(str) {
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
      filteredList.forEach(el => {
        if (opts.nameMap) {
          el["label"] = opts.nameMap[el.name];
        } else if (nameMaps[stat.name]) {
          el["label"] = nameMaps[stat.name][el.name];
        } else {
          el["label"] = el.name;
        }
      });
      // Add actual data for that point
      filteredList.forEach(el => {
        if (opts.aggregateFxn) {
          el["datum"] = opts.aggregateFxn(el);
        } else {
          el["datum"] = el.count;
        }
      });
      // Add Color - To allow constant colors on update allow a passed color object
      filteredList.forEach(el => {
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
      // Return it in ChartJS format
      return {
        datasets: [
          {
            data: filteredList.map(el => {
              return el.datum;
            }),
            backgroundColor: filteredList.map(el => {
              return el.color;
            })
          }
        ],
        labels: filteredList.map(el => {
          return el.label;
        }),
        names: filteredList.map(el => {
          return el.name;
        })
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
          backgroundColor: "#D70909" // Red
        },
        {
          label: "Flash",
          data: [],
          backgroundColor: "#006DDB" // Blue
        },
        {
          label: "Onsite",
          data: [],
          backgroundColor: "#3C0707" // Black-Red
        }
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
        labels: gradeList.map(k => {
          return "V" + k.name;
        }),
        names: gradeList.map(k => {
          return k.name;
        })
      };
    },
    decomposeDate(dateStr) {
      return {
        day: dateStr.substring(8, 10),
        month: dateStr.substring(5, 7),
        year: dateStr.substring(0, 4)
      };
    },
    generateTimeSeries(ascents, nTop = 10) {
      let ret = [];
      if (ascents.length > 0) {
        // Sort ascents with earliest ascent first
        ascents.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        // Continusously updates [Y] variables
        let gradeMax = 0;
        let gradeAvg = 0;
        let topGrades = [];
        for (let i = 0; i < nTop; i++) {
          topGrades.push(0);
        }
        //let gradeScore = 0;
        //let starAvg = 0;
        //let recommentPct = 0;
        //let commentLenAvg = 0;
        //let softness = 0;
        let cnt = 0;
        //let daysSinceMax = 0;
        // [X] variables: (day, month or year)
        //let tracker = this.decomposeDate(ascents[0].date);
        // Now iterate through and generate any relevant possible times series data
        for (let ascent of ascents) {
          cnt += 1;
          gradeMax = ascent.grade > gradeMax ? ascent.grade : gradeMax;
          gradeAvg =
            (this.mapGrade(ascent.grade, 0) + (cnt - 1) * gradeAvg) / cnt;
          // insert into topGrades
          //gradeScore =
          //  topGrades.reduce((a, b) => a + b, 0) / (cnt < nTop ? cnt : nTop);
          // now track day/month/year changes
          //let cur = this.decomposeDate(ascent.date);
          //if (cur.year != tracker.year) {
          //}
        }
      }

      return ret;
    }
  }
};
