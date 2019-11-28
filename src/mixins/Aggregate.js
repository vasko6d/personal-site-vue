import Utils from "@/mixins/Utils.js";
export default {
  name: "Aggregate",
  fxns: {
    avg: subName => {
      return stat => {
        let sub = stat.get(subName).subStats;
        let sum = 0;
        let cnt = 0;
        for (const subKey of Object.keys(sub)) {
          cnt += sub[subKey].count;
          sum += sub[subKey].count * Utils.methods.makeInt(subName, subKey);
        }
        return Math.round((10 * sum) / cnt) / 10;
      };
    },
    max: subName => {
      return stat => {
        let vals = Object.keys(stat.get(subName).subStats).map(el => {
          return Utils.methods.makeInt(subName, el);
        });
        return Math.max(...vals);
      };
    },
    count: (subName, subValue) => {
      return stat => {
        return stat.get(subName).get(subValue).count;
      };
    },
    pct: (subName, subValue) => {
      return stat => {
        let sub = stat.get(subName).subStats;
        let sum = 0;
        let cnt = 0;
        for (const subKey of Object.keys(sub)) {
          cnt += sub[subKey].count;
          if (sub[subKey].name.toString() === subValue.toString()) {
            sum += sub[subKey].count;
          }
        }
        return Math.round((1000 * sum) / cnt) / 10;
      };
    }
  },
  compatibility: {
    avg: ["grade", "rating", "year"],
    max: ["grade", "rating", "year"],
    pct: [
      "area",
      "commentLength",
      "date",
      "flags",
      "grade",
      "name",
      "rating",
      "recommend",
      "softness",
      "subArea",
      "type",
      "year"
    ],
    count: [
      "area",
      "commentLength",
      "date",
      "flags",
      "grade",
      "name",
      "rating",
      "recommend",
      "softness",
      "subArea",
      "type",
      "year"
    ]
  },
  needsSubValue: {
    count: true,
    pct: true
  },
  names: {
    avg: "Average",
    max: "Max",
    count: "Count",
    pct: "Percentage"
  }
};
