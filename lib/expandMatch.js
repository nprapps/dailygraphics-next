var minimatch = require("minimatch");
var fs = require("fs").promises;
var path = require("path");

var filterFile = function(file, patterns) {
  return patterns.some(function(p) {
    return minimatch(file, p, { matchBase: true });
  });
};

var expandMatch = async function(from, dir, patterns) {
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
      var children = await expandMatch(from, relative, patterns);
      matching.push(...children);
    } else {
      var matched = filterFile(relative, affirmative);
      var notExcluded = filterFile(relative, negative);
      if (matched && notExcluded) {
        matching.push(full);
      }
    }
  }
  return matching;
}

module.exports = expandMatch;