export default class Stat {
  /**
   * Stat is a light counter class to keep tract of relevant
   * counts in a standard way
   * @constructor
   */
  constructor(name, ignore = []) {
    this.name = name;
    this.count = 0;
    this.ready = false;
    this.values = [];
    this.subStats = {};
    this.ignore = new Set(ignore); // basicly an ignore list
  }

  addSubStat(name) {
    if (!this.subStats[name]) {
      this.subStats[name] = new Stat(name, this.ignore);
    }
  }

  addIgnore(name) {
    this.ignore.add(name);
  }

  goDeeper(rawValues = false) {
    if (rawValues) {
      this.values = rawValues;
      this.count = rawValues.length;
    }
    // Every new depth should actually create 2 deeper levels: 1st level is "catagory",
    // second level is the actual values
    const catagories =
      this.values && this.values.length > 0 ? Object.keys(this.values[0]) : [];
    for (const val of this.values) {
      for (const k of catagories) {
        if (!this.ignore.has(k)) {
          // First lets get and increment the "catagory" stat
          let catagoryStat = this.get(k, false, true);
          catagoryStat.increment(val);
          // now we can add and increment the values
          if (Array.isArray(val[k])) {
            for (const arrVal of val[k]) {
              let valueStat = catagoryStat.get(arrVal, false, true);
              valueStat.increment(val);
              valueStat.addIgnore(k + "|" + arrVal);
            }
          } else {
            let valueStat = catagoryStat.get(val[k], false, true);
            valueStat.increment(val);
            valueStat.addIgnore(k);
          }
        }
        this.get(k, false, true).ready = true;
      }
    }
    //console.log("Deeper Stat: ", this);
    this.ready = true;
  }

  subStatCount() {
    return Object.keys(this.subStats).length;
  }

  increment(value) {
    this.count++;
    this.values.push(value);
  }

  get(name, allowExpansion = true, createOnEmpty = false) {
    if (createOnEmpty) {
      this.addSubStat(name);
    }
    if (allowExpansion && !this.ready) {
      this.goDeeper();
    }
    return this.subStats[name] || new Stat("empty");
  }

  getFromPath(statPath) {
    // Validate Stat Path
    if (statPath.length % 2 != 1) {
      throw "[Invalid Stat Path] - The provided statPath [" +
        statPath +
        "], is not odd in length";
    }
    // Get stat from Stat Path
    let stat = this.get(statPath[0]);
    for (let i = 1; i < statPath.length; i++) {
      stat = stat.get(statPath[i]);
    }
    return stat;
  }

  getFiltered(base, filters) {
    let stat = this;
    if (filters && Object.keys(filters).length > 0) {
      for (const cat of Object.keys(filters)) {
        if (filters[cat] != null) {
          //console.log("> Filter: " + filter);
          stat = stat.get(cat);
          //console.log("> Value: " + filters[filter]);
          stat = stat.get(filters[cat], true, false);
        }
      }
    }
    if (base) {
      stat = stat.get(base);
    }
    return stat;
  }
}
