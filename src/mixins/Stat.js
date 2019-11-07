export default class Stat {
  /**
   * Stat is a light counter class to keep tract of relevant
   * counts in a standard way
   * @constructor
   */
  constructor(name) {
    this.name = name;
    this.count = 0;
    this.values = [];
    this.subStats = {};
  }

  addSubStat(name) {
    if (!this.subStats[name]) {
      this.subStats[name] = new Stat(name);
    }
  }

  subStatCount() {
    return Object.keys(this.subStats).length;
  }

  increment(value) {
    this.count++;
    this.values.push(value);
  }

  get(name) {
    return this.subStats[name];
  }

  incrementSubStat(name, value) {
    if (!this.subStats[name]) {
      this.addSubStat(name);
    }
    this.subStats[name].increment(value);
  }
}
