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
    const catagories = Object.keys(this.values[0]);
    for (const val of this.values) {
      for (const k of catagories) {
        if (!this.ignore.has(k)) {
          this.get(k, false, true).increment(val);
          let newStat = this.get(k, false, true).get(val[k], false, true);
          newStat.increment(val);
          newStat.addIgnore(k);
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
}
