var fs = require("fs").promises;
var path = require("path");

var copyDir = async function(sourceDir, targetDir) {
  var toCopy = await fs.readdir(sourceDir);
  for (var i = 0; i < toCopy.length; i++) {
    var f = toCopy[i];
    // ignore hidden files
    if (f[0] == ".") continue;
    var source = path.join(sourceDir, f);
    var target = path.join(targetDir, f);
    var stats = await fs.stat(source);
    if (stats.isDirectory()) {
      try {
        await fs.mkdir(target);
      } catch (err) {
        // it's fine if it exists
      }
      await copyDir(source, target);
    } else {
      await fs.copyFile(source, target);
    }
  }
};

module.exports = copyDir;
