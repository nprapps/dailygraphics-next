var fs = require("fs").promises;
var minimatch = require("minimatch");
var path = require("path");

var filterFile = function(file, patterns, strict) {
  return patterns[strict ? "every" : "some"](function(p) {
    return minimatch(file, p, { matchBase: true });
  });
};

var expand = async function(from, dir, patterns) {
  var fullDir = path.join(from, dir);
  var files = await fs.readdir(fullDir);
  var matching = [];
  var affirmative = patterns.filter(p => p[0] != "!");
  var negative = patterns.filter(p => p[0] == "!");
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var full = path.join(from, dir, f);
    var relative = path.relative(from, full);
    var stat = await fs.stat(full);
    if (stat.isDirectory()) {
      var children = await expand(from, relative, patterns);
      matching.push(...children);
    } else {
      var matched = filterFile(relative, affirmative);
      var notExcluded = filterFile(relative, negative, true);
      if (matched && notExcluded) {
        matching.push(full);
      }
    }
  }
  return matching;
};

var expandMatch = async function(from, dir, patterns) {
  var paths = await expand(from, dir, patterns);
  return paths.map(f => ({
    full: f,
    relative: path.relative(from, f)
  }));
};

module.exports = expandMatch;
