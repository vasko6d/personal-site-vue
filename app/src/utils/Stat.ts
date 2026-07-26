// Object keys used throughout the climbing stat tree - ascent field values
// (grade, year, recommend, etc) end up here, and JS coerces all of them to
// string when used as object keys, so we do that coercion explicitly.
export type StatKey = string | number | boolean;

export interface StatFilterEntry {
  val?: StatKey | null;
}

export type StatFilters = Record<string, StatFilterEntry>;

export default class Stat {
  /**
   * Stat is a light counter class to keep tract of relevant
   * counts in a standard way
   * @constructor
   */
  name: StatKey;
  count: number;
  ready: boolean;
  values: Record<string, unknown>[];
  subStats: Record<string, Stat>;
  ignore: Set<string>;

  constructor(name: StatKey, ignore: Iterable<string> = []) {
    this.name = name;
    this.count = 0;
    this.ready = false;
    this.values = [];
    this.subStats = {};
    this.ignore = new Set(ignore); // basicly an ignore list
  }

  addSubStat(name: StatKey) {
    const key = String(name);
    if (!this.subStats[key]) {
      this.subStats[key] = new Stat(name, this.ignore);
    }
  }

  addIgnore(name: string) {
    this.ignore.add(name);
  }

  goDeeper(rawValues: Record<string, unknown>[] | false = false) {
    if (rawValues) {
      this.values = rawValues;
      this.count = rawValues.length;
    }
    // Every new depth should actually create 2 deeper levels: 1st level is "catagory",
    // second level is the actual values
    const catagories = this.values.length > 0 ? Object.keys(this.values[0]!) : [];
    for (const val of this.values) {
      for (const k of catagories) {
        if (!this.ignore.has(k)) {
          // First lets get and increment the "catagory" stat
          const catagoryStat = this.get(k, false, true);
          catagoryStat.increment(val);
          // now we can add and increment the values
          const fieldValue = val[k];
          if (Array.isArray(fieldValue)) {
            for (const arrVal of fieldValue as StatKey[]) {
              const valueStat = catagoryStat.get(arrVal, false, true);
              valueStat.increment(val);
              valueStat.addIgnore(k + "|" + arrVal);
            }
          } else {
            const valueStat = catagoryStat.get(fieldValue as StatKey, false, true);
            valueStat.increment(val);
            valueStat.addIgnore(k);
          }
        }
        this.get(k, false, true).ready = true;
      }
    }
    this.ready = true;
  }

  subStatCount(): number {
    return Object.keys(this.subStats).length;
  }

  increment(value: Record<string, unknown>) {
    this.count++;
    this.values.push(value);
  }

  get(name: StatKey, allowExpansion = true, createOnEmpty = false): Stat {
    if (createOnEmpty) {
      this.addSubStat(name);
    }
    if (allowExpansion && !this.ready) {
      this.goDeeper();
    }
    return this.subStats[String(name)] || new Stat("empty");
  }

  getFromPath(statPath: StatKey[]): Stat {
    // Validate Stat Path
    if (statPath.length % 2 != 1) {
      throw (
        "[Invalid Stat Path] - The provided statPath [" +
        statPath +
        "], is not odd in length"
      );
    }
    // Get stat from Stat Path
    let stat = this.get(statPath[0]!);
    for (let i = 1; i < statPath.length; i++) {
      stat = stat.get(statPath[i]!);
    }
    return stat;
  }

  getFiltered(base?: StatKey, filters?: StatFilters): Stat {
    return Stat.applyFilters(this, base, filters);
  }

  private static applyFilters(start: Stat, base?: StatKey, filters?: StatFilters): Stat {
    let stat = start;
    if (filters && Object.keys(filters).length > 0) {
      for (const cat of Object.keys(filters)) {
        const filterVal = filters[cat]!.val;
        if (filterVal != null) {
          stat = stat.get(cat);
          stat = stat.get(filterVal, true, false);
        }
      }
    }
    if (base) {
      stat = stat.get(base);
    }
    return stat;
  }
}
