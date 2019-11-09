export default class Stat {
  /**
   * Stat is a light counter class to keep tract of relevant
   * counts in a standard way
   * @constructor
   */
  constructor(name, parents = []) {
    this.name = name;
    this.count = 0;
    this.ready = false;
    this.values = [];
    this.subStats = {};
    this.parents = new Set(parents); // basicly an ignore list
  }

  addSubStat(name) {
    if (!this.subStats[name]) {
      this.subStats[name] = new Stat(name, this.parents);
      this.subStats[name].addParent(this.name);
    }
  }

  addParent(name) {
    this.parents.add(name);
  }

  goDeeper(rawValues = false) {
    if (rawValues) {
      this.values = rawValues;
      this.count = rawValues.length;
    }
    const catagories = Object.keys(this.values[0]);
    for (const val of this.values) {
      for (const k of catagories) {
        if (!this.parents.has(k)) {
          this.get(k, false).increment(val);
          if (!this.parents.has(val[k])) {
            this.get(k, false)
              .get(val[k], false)
              .increment(val);
          }
          this.get(k, false).ready = true;
        }
      }
    }
    this.ready = true;
  }

  subStatCount() {
    return Object.keys(this.subStats).length;
  }

  increment(value) {
    this.count++;
    this.values.push(value);
  }

  get(name, allowExpansion = true) {
    this.addSubStat(name);
    if (allowExpansion && !this.ready) {
      this.goDeeper();
    }
    return this.subStats[name];
  }
}
