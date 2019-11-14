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
              reldif = "Soft";
              break;
            case "Hard":
              reldif = "Hard";
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
      // Sort with optional passed sort function
      if (opts.sortFxn) {
        statList.sort(opts.sortFxn);
      } else {
        statList.sort();
      }
      // Filter is given a filter function (shallow copy)
      let filteredList = [...statList];
      if (opts.filterFxn) {
        filteredList = filteredList.filter(opts.filterFxn);
      }
      // To prevent jarring color changes if possible values
      // dissipear on an update, use an optional color map to preserve old color.
      let colors;
      if (opts.colors) {
        colors = filteredList.map(el => {
          let mappedName = opts.nameMap ? opts.nameMap[el.name] : el.name;
          return opts.colors[mappedName];
        });
      } else {
        colors = [];
        for (let i = 0; i < filteredList.length; i++) {
          colors.push(this.getRandomColor());
        }
      }
      // The labels can use a name map if desired
      let labels = filteredList.map(el => {
        if (opts.nameMap) {
          return opts.nameMap[el.name];
        }
        return el.name;
      });

      // Now construct the desired format for chartjs
      return {
        datasets: [
          {
            data: filteredList.map(el => {
              return el.count;
            }),
            backgroundColor: colors
          }
        ],
        labels: labels
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
