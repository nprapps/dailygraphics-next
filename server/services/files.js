module.exports = function(app) {
  var files = {
    readJSON: require("../../lib/readJSON"),
    copyDir: require("../../lib/copyDirectory"),
    expandMatch: require("../../lib/expandMatch")
  };

  app.set("fs", files);
}