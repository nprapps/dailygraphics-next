module.exports = function(app) {
  var files = {
    copyDir: require("../../lib/copyDirectory"),
    expandMatch: require("../../lib/expandMatch"),
    readJSON: require("../../lib/readJSON")
  };

  app.set("fs", files);
}