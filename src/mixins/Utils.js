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
    mapGrade(grade, sys = "V") {
      // V or font will eventually be supported
      if (sys === "V") {
        return gradeMap[grade];
      }
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
        //ascent["commentLength"] = ascent["comment"].length; // doing this in scraper... should move to here

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

        // Year is useful
        ascent["year"] = ascent["date"].substring(0, 4);
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
          el["color"] = opts.colors[el.label];
        } else {
          el["color"] = this.getRandomColor();
        }
      });
      // Sort data
      const defaultSort = (a, b) => {
        return b.datum - a.datum;
      };
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
        })
      };
    },
    getGradeChartData(stat, allowExpansion = true) {
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
        if (types.get("redpoint", allowExpansion)) {
          cnt = types.get("redpoint", allowExpansion).count;
        }
        datasets[0].data.push(cnt);

        cnt = 0;
        if (types.get("flash", allowExpansion)) {
          cnt = types.get("flash", allowExpansion).count;
        }
        datasets[1].data.push(cnt);

        cnt = 0;
        if (types.get("onsite", allowExpansion)) {
          cnt = types.get("onsite", allowExpansion).count;
        }
        datasets[2].data.push(cnt);
      }
      return {
        datasets: datasets,
        labels: gradeList.map(k => {
          return "V" + k.name;
        })
      };
    }
  }
};
