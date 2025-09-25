/*

Used to find files based on a glob pattern.
Primarily used for the manifest deployment list.

*/

var fs = require("fs").promises;
var { minimatch } = require("minimatch");
var path = require("path");

// check if a file matches any or all (strict mode) patterns in a list
var filterFile = function(file, patterns, strict) {
  return patterns[strict ? "every" : "some"](function(p) {
    return minimatch(file, p, { matchBase: true, nocase: true });
  });
};

// implements glob matching for a directory based on a list of patterns
// returns all files that match
var expand = async function(from, dir, patterns) {
  var fullDir = path.join(from, dir);
  try {
    var files = await fs.readdir(fullDir);
  } catch (err) {
    console.log(`Unable to read directory ${fullDir} - does it exist?`);
    return [];
  }
  var matching = [];
  var affirmative = patterns.filter(p => p[0] != "!");
  var negative = patterns.filter(p => p[0] == "!");
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var full = path.join(from, dir, f);
    var relative = path.relative(from, full);
    try {
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
    } catch (err) {
      console.log(err);
      console.log(`Unable to expand matches for path ${f}`);
    }
  }
  return matching;
};

// expand a directory, then return objects with the full and relative paths for each
var expandMatch = async function(from, dir, patterns) {
  var paths = await expand(from, dir, patterns);
  return paths.map(f => ({
    full: f,
    relative: path.relative(from, f)
  }));
};

module.exports = expandMatch;
