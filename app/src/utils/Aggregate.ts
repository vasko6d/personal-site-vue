import Stat, { type StatKey } from "./Stat";
import { makeInt, prettyCapitalize } from "./Utils";

const ALL = [
  "area",
  "subArea",
  "year",
  "month",
  "day",
  "dayOfWeek",
  "date",
  "commentLength",
  "recommend",
  "grade",
  "rating",
  "softness",
  "flags",
  "country",
  "state",
  "type",
  "name",
];

export type AggregatorName = "avg" | "max" | "sum" | "pct" | "count" | "distinctCount";
export type AggregatorFn = (stat: Stat) => number;

const fxns: Record<AggregatorName, (subName: string, subValue?: StatKey) => AggregatorFn> = {
  avg: (subName) => {
    return (stat) => {
      const sub = stat.get(subName).subStats;
      let sum = 0;
      let cnt = 0;
      for (const subKey of Object.keys(sub)) {
        cnt += sub[subKey]!.count;
        sum += sub[subKey]!.count * makeInt(subName, subKey);
      }
      return Math.round((10 * sum) / cnt) / 10;
    };
  },
  max: (subName) => {
    return (stat) => {
      const vals = Object.keys(stat.get(subName).subStats).map((el) => makeInt(subName, el));
      return Math.max(...vals);
    };
  },
  count: (subName, subValue) => {
    return (stat) => {
      return stat.get(subName).get(subValue as StatKey).count;
    };
  },
  distinctCount: (subName) => {
    return (stat) => {
      return stat.get(subName).subStatCount();
    };
  },
  pct: (subName, subValue) => {
    return (stat) => {
      const sub = stat.get(subName).subStats;
      let sum = 0;
      let cnt = 0;
      for (const subKey of Object.keys(sub)) {
        cnt += sub[subKey]!.count;
        if (sub[subKey]!.name.toString() === (subValue as StatKey).toString()) {
          sum += sub[subKey]!.count;
        }
      }
      return Math.round((1000 * sum) / cnt) / 10;
    };
  },
  sum: (subName) => {
    return (stat) => {
      const sub = stat.get(subName).subStats;
      let sum = 0;
      for (const subKey of Object.keys(sub)) {
        sum += sub[subKey]!.count * makeInt(subName, subKey);
      }
      return Math.round(sum);
    };
  },
};

const compatibility: Record<AggregatorName, string[]> = {
  avg: ["grade", "rating", "year", "commentLength"],
  max: ["grade", "rating", "year", "commentLength"],
  sum: ["grade", "commentLength"],
  pct: ALL,
  count: ALL,
  distinctCount: ALL,
};

const needsSubValue: Partial<Record<AggregatorName, boolean>> = {
  count: true,
  pct: true,
};

const names: Record<AggregatorName, string> = {
  avg: "Average",
  max: "Max",
  sum: "Sum",
  pct: "Percentage",
  count: "Count with Value",
  distinctCount: "Count Distinct",
};

function makeTitle(aggregator: AggregatorName, catagory: string, value?: StatKey): string {
  let ret = "";
  ret += names[aggregator] + " ";
  if (value != null) {
    ret += "(";
  }
  ret += prettyCapitalize(catagory);
  if (value != null) {
    ret += " = " + value + ")";
  }
  return ret;
}

export default {
  name: "Aggregate",
  fxns,
  compatibility,
  needsSubValue,
  names,
  makeTitle,
};
