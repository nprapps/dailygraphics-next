// MemoryPalace is an infinitely-partitionable, non-expiring cache

var MemoryPalace = function() {
  this.clear();
};

MemoryPalace.prototype = {
  partition: function(...path) {
    var segment = path.shift();
    var p = this.partitions[segment];
    if (!p) {
      p = this.partitions[segment] = new MemoryPalace();
    }
    if (path.length) {
      return p.partition(...path);
    }
    return p;
  },
  get: function(key) {
    return this.data[key];
  },
  set: function(key, value) {
    this.data[key] = value;
  },
  clear: function() {
    this.data = {};
    this.partitions = {};
  }
}

module.exports = MemoryPalace;