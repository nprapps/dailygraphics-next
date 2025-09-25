// MemoryPalace is an infinitely-partitionable, non-expiring cache

var clone = typeof structuredClone == "function" ? structuredClone :  v => JSON.parse(JSON.stringify(v));


class MemoryPalace {

  constructor() {
    this.clear();
  }

  hasPartition(p) {
    return p in this.partitions;
  }

  partition(...path) {
    var segment = path.shift();
    var p = this.partitions[segment];
    if (!p) {
      p = this.partitions[segment] = new MemoryPalace();
    }
    if (path.length) {
      return p.partition(...path);
    }
    return p;
  }

  get(key) {
    return this.data[key];
  }

  // support getting a distinct clone
  // this helps with running multiple templating processes during deploy
  // as it prevents them from mutating each others' data
  getCloned(key) {
    var value = this.data[key];
    return value ? clone(this.data[key]) : null;
  }

  set(key, value) {
    this.data[key] = value;
  }

  clear() {
    this.data = {};
    this.partitions = {};
  }
};

module.exports = function(app) {
  app.set("cache", new MemoryPalace());
};
