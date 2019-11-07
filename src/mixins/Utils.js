var gradeMap = {
  B: -1,
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "7/8": 7.5,
  "8": 8,
  "9": 9,
  "10": 10
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
    mapGrade(grade, sys = "V") {
      // V or font will eventually be supported
      if (sys === "V") {
        return gradeMap[grade];
      }
    },
    standardizeAreaName(area) {
      let standArea = area
        .toUpperCase()
        .trim()
        .replace(/\s+/g, "_");
      return standArea;
    },
    getPieChartData(stat, sortFxn = false) {
      let statList = Object.values(stat.subStats);
      if (sortFxn) {
        statList.sort(sortFxn);
      } else {
        statList.sort();
      }
      let colors = [];
      for (let i = 0; i < statList.length; i++) {
        colors.push(this.getRandomColor());
      }
      return {
        datasets: [
          {
            data: statList.map(k => {
              return k.count;
            }),
            backgroundColor: colors
          }
        ],
        labels: statList.map(k => {
          return k.name;
        })
      };
    },
    getGradeChartData(stat) {
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
      for (const grade of gradeList) {
        const types = grade.get("type");
        let cnt = 0;
        if (types.get("redpoint")) {
          cnt = types.get("redpoint").count;
        }
        datasets[0].data.push(cnt);

        cnt = 0;
        if (types.get("flash")) {
          cnt = types.get("flash").count;
        }
        datasets[1].data.push(cnt);

        cnt = 0;
        if (types.get("onsite")) {
          cnt = types.get("onsite").count;
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