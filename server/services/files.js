module.exports = function(app) {
  var files = {
    readJSON: require("../../lib/readJSON"),
    copyDir: require("../../lib/copyDirectory")
  };

  app.set("fs", files);
}